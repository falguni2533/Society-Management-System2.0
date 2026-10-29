const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// In-Memory Storage Tables
const memoryStore = {
  users: [],
  flats: [],
  complaints: [],
  notices: [],
  bills: [],
  visitors: [],
};

// Helper to create ObjectId
const newId = () => new mongoose.Types.ObjectId();

// Filter matcher
const matchesFilter = (item, filter) => {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const orMatch = val.some((subFilter) => matchesFilter(item, subFilter));
      if (!orMatch) return false;
      continue;
    }

    const itemVal = item[key];

    if (val && typeof val === 'object') {
      if (val instanceof mongoose.Types.ObjectId) {
        if (!itemVal || itemVal.toString() !== val.toString()) return false;
        continue;
      }
      if (val.$ne !== undefined) {
        if (itemVal === val.$ne) return false;
      }
      if (val.$in !== undefined && Array.isArray(val.$in)) {
        if (!val.$in.some((v) => v.toString() === (itemVal ? itemVal.toString() : ''))) return false;
      }
      if (val.$gte !== undefined) {
        const itemDate = new Date(itemVal).getTime();
        const targetDate = new Date(val.$gte).getTime();
        if (itemDate < targetDate) return false;
      }
      if (val.$lte !== undefined) {
        const itemDate = new Date(itemVal).getTime();
        const targetDate = new Date(val.$lte).getTime();
        if (itemDate > targetDate) return false;
      }
      if (val.$regex !== undefined) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(itemVal || '')) return false;
      }
      continue;
    }

    // Direct comparison
    if (itemVal instanceof mongoose.Types.ObjectId || (val && typeof val.toString === 'function')) {
      if ((itemVal ? itemVal.toString() : '') !== (val ? val.toString() : '')) {
        return false;
      }
    } else if (itemVal !== val) {
      return false;
    }
  }

  return true;
};

// Populate Resolver
const populateItem = (item, populatePath, store) => {
  if (!item) return item;
  const clone = { ...item };

  const paths = Array.isArray(populatePath) ? populatePath : [populatePath];

  for (const pop of paths) {
    if (!pop) continue;
    let field = typeof pop === 'string' ? pop : pop.path;
    let subPop = typeof pop === 'object' ? pop.populate : null;
    let select = typeof pop === 'object' ? pop.select : null;

    let targetCollection = null;
    if (field === 'flat') targetCollection = store.flats;
    if (field === 'resident' || field === 'owner' || field === 'securityGuard' || field === 'author' || field === 'createdBy') {
      targetCollection = store.users;
    }

    if (targetCollection && clone[field]) {
      const rawVal = clone[field];
      const targetId = rawVal && rawVal._id ? rawVal._id.toString() : rawVal ? rawVal.toString() : null;
      let matched = targetCollection.find((t) => (t._id ? t._id.toString() : '') === targetId);

      if (matched) {
        let populatedDoc = { ...matched };
        if (subPop) {
          populatedDoc = populateItem(populatedDoc, subPop, store);
        }
        if (select) {
          const selectFields = select.split(' ');
          const filtered = { _id: populatedDoc._id };
          selectFields.forEach((f) => {
            if (f && populatedDoc[f] !== undefined) filtered[f] = populatedDoc[f];
          });
          clone[field] = createDocInstance(filtered, targetCollection, store);
        } else {
          clone[field] = createDocInstance(populatedDoc, targetCollection, store);
        }
      }
    }
  }

  return clone;
};

// Document wrapper with .save(), .equals(), .toJSON(), matchPassword(), and .id getter
const createDocInstance = (data, collection, store) => {
  if (!data) return null;

  const doc = {
    ...data,
    _id: data._id instanceof mongoose.Types.ObjectId ? data._id : new mongoose.Types.ObjectId(data._id),
  };

  Object.defineProperty(doc, 'id', {
    get: function () {
      return this._id ? this._id.toString() : undefined;
    },
    enumerable: true,
  });

  doc.equals = function (other) {
    if (!other) return false;
    const otherId = other._id ? other._id.toString() : other.toString();
    return doc._id.toString() === otherId;
  };

  doc.toJSON = function () {
    const obj = { ...doc };
    delete obj.password;
    delete obj.save;
    delete obj.equals;
    delete obj.toJSON;
    delete obj.toObject;
    delete obj.matchPassword;
    if (obj.flat && typeof obj.flat.toJSON === 'function') {
      obj.flat = obj.flat.toJSON();
    }
    if (obj.resident && typeof obj.resident.toJSON === 'function') {
      obj.resident = obj.resident.toJSON();
    }
    return obj;
  };

  doc.toObject = doc.toJSON;

  doc.matchPassword = async function (enteredPassword) {
    if (!doc.password) return false;
    return await bcrypt.compare(enteredPassword, doc.password);
  };

  doc.save = async function () {
    doc.updatedAt = new Date();
    const idx = collection.findIndex((d) => d._id.toString() === doc._id.toString());
    if (idx !== -1) {
      collection[idx] = { ...doc };
    } else {
      collection.push(doc);
    }
    return doc;
  };

  return doc;
};

// Query Chain Builder
const createQueryChain = (items, collection, store, single = false) => {
  let resultItems = [...items];
  const populates = [];
  let sortField = null;

  const chain = {
    populate: function (path, select) {
      if (typeof path === 'string') {
        populates.push({ path, select });
      } else if (typeof path === 'object') {
        populates.push(path);
      }
      return chain;
    },
    select: function (fields) {
      // select '+password' or fields
      if (typeof fields === 'string' && fields.includes('+password')) {
        // keep password
      }
      return chain;
    },
    sort: function (sortObj) {
      sortField = sortObj;
      return chain;
    },
    then: function (resolve, reject) {
      try {
        let processed = resultItems.map((it) => {
          let populated = it;
          for (const pop of populates) {
            populated = populateItem(populated, pop, store);
          }
          return createDocInstance(populated, collection, store);
        });

        if (single) {
          resolve(processed.length > 0 ? processed[0] : null);
        } else {
          resolve(processed);
        }
      } catch (e) {
        if (reject) reject(e);
        else throw e;
      }
    },
  };

  return chain;
};

// Attach In-Memory Model Interceptor
const patchModel = (Model, collectionName, store) => {
  const getCollection = () => store[collectionName];

  Model.create = async function (docData) {
    const collection = getCollection();
    const docs = Array.isArray(docData) ? docData : [docData];
    const created = [];

    for (const d of docs) {
      const item = {
        ...d,
        _id: d._id || newId(),
        createdAt: d.createdAt || new Date(),
        updatedAt: d.updatedAt || new Date(),
      };

      if (collectionName === 'users') {
        item.status = item.status || 'active';
        item.role = item.role || 'resident';
        if (item.password) {
          const salt = await bcrypt.genSalt(10);
          item.password = await bcrypt.hash(item.password, salt);
        }
      }

      if (collectionName === 'flats') {
        item.status = item.status || 'vacant';
        item.type = item.type || '2BHK';
        item.residents = item.residents || [];
      }

      if (collectionName === 'complaints') {
        item.status = item.status || 'Open';
        item.priority = item.priority || 'Medium';
        item.category = item.category || 'Other';
      }

      if (collectionName === 'bills') {
        item.status = item.status || 'Pending';
        item.billType = item.billType || 'Maintenance';
      }

      if (collectionName === 'visitors') {
        item.status = item.status || 'Pre-Approved';
        item.purpose = item.purpose || 'Guest / Family';
      }

      const instance = createDocInstance(item, collection, store);
      collection.push(item);
      created.push(instance);
    }

    return Array.isArray(docData) ? created : created[0];
  };

  Model.insertMany = async function (docs) {
    return await Model.create(docs);
  };

  Model.find = function (filter = {}) {
    const collection = getCollection();
    const matched = collection.filter((it) => matchesFilter(it, filter));
    return createQueryChain(matched, collection, store, false);
  };

  Model.findOne = function (filter = {}) {
    const collection = getCollection();
    const matched = collection.filter((it) => matchesFilter(it, filter));
    return createQueryChain(matched, collection, store, true);
  };

  Model.findById = function (id) {
    const collection = getCollection();
    const targetId = id && id._id ? id._id.toString() : id ? id.toString() : null;
    const matched = collection.filter((it) => it._id && it._id.toString() === targetId);
    return createQueryChain(matched, collection, store, true);
  };

  Model.countDocuments = async function (filter = {}) {
    const collection = getCollection();
    return collection.filter((it) => matchesFilter(it, filter)).length;
  };

  Model.deleteMany = async function (filter = {}) {
    const collection = getCollection();
    if (!filter || Object.keys(filter).length === 0) {
      collection.length = 0;
      return { deletedCount: 0 };
    }
    const toDelete = collection.filter((it) => matchesFilter(it, filter));
    toDelete.forEach((d) => {
      const idx = collection.findIndex((c) => c._id.toString() === d._id.toString());
      if (idx !== -1) collection.splice(idx, 1);
    });
    return { deletedCount: toDelete.length };
  };

  Model.findByIdAndDelete = async function (id) {
    const collection = getCollection();
    const targetId = id && id._id ? id._id.toString() : id ? id.toString() : null;
    const idx = collection.findIndex((it) => it._id && it._id.toString() === targetId);
    if (idx !== -1) {
      const removed = collection.splice(idx, 1)[0];
      return createDocInstance(removed, collection, store);
    }
    return null;
  };
};

const setupTestDatabase = async () => {
  const User = require('./models/User');
  const Flat = require('./models/Flat');
  const Complaint = require('./models/Complaint');
  const Notice = require('./models/Notice');
  const Bill = require('./models/Bill');
  const Visitor = require('./models/Visitor');

  // Clear memory in-place
  memoryStore.users.length = 0;
  memoryStore.flats.length = 0;
  memoryStore.complaints.length = 0;
  memoryStore.notices.length = 0;
  memoryStore.bills.length = 0;
  memoryStore.visitors.length = 0;

  // Patch all models to use in-memory store
  patchModel(User, 'users', memoryStore);
  patchModel(Flat, 'flats', memoryStore);
  patchModel(Complaint, 'complaints', memoryStore);
  patchModel(Notice, 'notices', memoryStore);
  patchModel(Bill, 'bills', memoryStore);
  patchModel(Visitor, 'visitors', memoryStore);

  // 1. Create Demo Flats
  const flatsToCreate = [
    { wing: 'A', flatNumber: '101', floor: 1, type: '2BHK', status: 'vacant' },
    { wing: 'A', flatNumber: '102', floor: 1, type: '2BHK', status: 'vacant' },
    { wing: 'A', flatNumber: '201', floor: 2, type: '3BHK', status: 'vacant' },
    { wing: 'A', flatNumber: '202', floor: 2, type: '3BHK', status: 'vacant' },
    { wing: 'B', flatNumber: '101', floor: 1, type: '2BHK', status: 'vacant' },
    { wing: 'B', flatNumber: '102', floor: 1, type: '1BHK', status: 'vacant' },
    { wing: 'B', flatNumber: '201', floor: 2, type: '3BHK', status: 'vacant' },
    { wing: 'B', flatNumber: '202', floor: 2, type: '4BHK', status: 'vacant' },
    { wing: 'C', flatNumber: '101', floor: 1, type: '2BHK', status: 'vacant' },
    { wing: 'C', flatNumber: '102', floor: 1, type: '2BHK', status: 'vacant' },
  ];

  const createdFlats = await Flat.insertMany(flatsToCreate);
  const flatA101 = createdFlats.find((f) => f.wing === 'A' && f.flatNumber === '101');
  const flatB201 = createdFlats.find((f) => f.wing === 'B' && f.flatNumber === '201');

  // 2. Create Users
  const usersToCreate = [
    {
      name: 'System Administrator',
      email: 'admin@society.com',
      password: 'admin123',
      phone: '+1-555-0100',
      role: 'admin',
      status: 'active',
    },
    {
      name: 'John Resident',
      email: 'resident@society.com',
      password: 'resident123',
      phone: '+1-555-0200',
      role: 'resident',
      flat: flatA101 ? flatA101._id : null,
      status: 'active',
    },
    {
      name: 'Sarah Smith',
      email: 'sarah@society.com',
      password: 'resident123',
      phone: '+1-555-0201',
      role: 'resident',
      flat: flatB201 ? flatB201._id : null,
      status: 'active',
    },
    {
      name: 'Main Gate Officer',
      email: 'security@society.com',
      password: 'security123',
      phone: '+1-555-0300',
      role: 'security',
      status: 'active',
    },
  ];

  const createdUsers = [];
  for (const u of usersToCreate) {
    const user = await User.create(u);
    createdUsers.push(user);
  }

  const john = createdUsers.find((u) => u.email === 'resident@society.com');
  const sarah = createdUsers.find((u) => u.email === 'sarah@society.com');

  if (flatA101 && john) {
    flatA101.owner = john._id;
    flatA101.residents = [john._id];
    flatA101.status = 'occupied';
    await flatA101.save();
  }

  if (flatB201 && sarah) {
    flatB201.owner = sarah._id;
    flatB201.residents = [sarah._id];
    flatB201.status = 'occupied';
    await flatB201.save();
  }
};

const teardownTestDatabase = async () => {
  memoryStore.users = [];
  memoryStore.flats = [];
  memoryStore.complaints = [];
  memoryStore.notices = [];
  memoryStore.bills = [];
  memoryStore.visitors = [];
};

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
};
