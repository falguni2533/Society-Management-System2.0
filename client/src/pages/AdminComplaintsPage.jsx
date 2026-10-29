import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import complaintService
  from '../services/complaintService';

import {
  MessageSquareWarning,
  Search,
  Clock3,
  CheckCircle2,
  AlertCircle,
  UserRound,
  CalendarDays,
  RefreshCw,
  ChevronRight,
  X,
} from 'lucide-react';

import './AdminComplaintsPage.css';


const AdminComplaintsPage = () => {

  const navigate = useNavigate();

  const [complaints, setComplaints] =
    useState([]);

  const [activeFilter, setActiveFilter] =
    useState('All');

  const [searchTerm, setSearchTerm] =
    useState('');

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  const fetchComplaints = async () => {

    try {

      setLoading(true);

      setError('');

      const response =
        await complaintService
          .getAllComplaints();

      if (response.success) {
        setComplaints(
          response.data || []
        );
      }

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to load registered complaints.'
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchComplaints();

  }, []);


  const filteredComplaints =
    useMemo(() => {

      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return complaints.filter((item) => {

        const filterMatch =
          activeFilter === 'All' ||
          item.status === activeFilter;

        const resident =
          item.resident?.name || '';

        const flat =
          item.resident?.flat
            ? `${item.resident.flat.wing}-${item.resident.flat.flatNumber}`
            : '';

        const text =
          `
            ${item.referenceNumber || ''}
            ${item.title || ''}
            ${item.description || ''}
            ${resident}
            ${flat}
            ${item.category || ''}
          `.toLowerCase();

        return (
          filterMatch &&
          (!query || text.includes(query))
        );

      });

    }, [
      complaints,
      activeFilter,
      searchTerm,
    ]);


  const counts = {

    all:
      complaints.length,

    open:
      complaints.filter(
        (x) => x.status === 'Open'
      ).length,

    progress:
      complaints.filter(
        (x) =>
          x.status === 'In Progress'
      ).length,

    resolved:
      complaints.filter(
        (x) =>
          x.status === 'Resolved'
      ).length,

  };


  const filters = [
    'All',
    'Open',
    'In Progress',
    'Resolved',
  ];


  const statusIcon = (status) => {

    if (status === 'Resolved') {
      return (
        <CheckCircle2 size={15} />
      );
    }

    if (status === 'In Progress') {
      return (
        <Clock3 size={15} />
      );
    }

    return (
      <AlertCircle size={15} />
    );

  };


  return (

    <div className="admin-complaints-page">


      {/* HEADER */}

      <div className="admin-subpage-header">

        <div>

          <span className="admin-subpage-kicker">

            <MessageSquareWarning
              size={14}
            />

            SOCIETY ADMINISTRATION

          </span>


          <h1>
            Registered Complaints
          </h1>


          <p>
            Only complaints actually
            submitted from the Resident
            Portal are displayed here.
          </p>

        </div>


        <button
          className="admin-outline-button"
          onClick={fetchComplaints}
        >

          <RefreshCw size={16} />

          Refresh

        </button>

      </div>


      {error && (

        <div className="admin-page-error">
          {error}
        </div>

      )}


      {/* SUMMARY */}

      <div className="complaint-summary-grid">

        <button
          className="
            complaint-summary-card
            blue
          "
          onClick={() =>
            setActiveFilter('All')
          }
        >

          <MessageSquareWarning />

          <span>
            Total
          </span>

          <strong>
            {counts.all}
          </strong>

        </button>


        <button
          className="
            complaint-summary-card
            amber
          "
          onClick={() =>
            setActiveFilter('Open')
          }
        >

          <AlertCircle />

          <span>
            Open
          </span>

          <strong>
            {counts.open}
          </strong>

        </button>


        <button
          className="
            complaint-summary-card
            purple
          "
          onClick={() =>
            setActiveFilter('In Progress')
          }
        >

          <Clock3 />

          <span>
            In Progress
          </span>

          <strong>
            {counts.progress}
          </strong>

        </button>


        <button
          className="
            complaint-summary-card
            green
          "
          onClick={() =>
            setActiveFilter('Resolved')
          }
        >

          <CheckCircle2 />

          <span>
            Resolved
          </span>

          <strong>
            {counts.resolved}
          </strong>

        </button>

      </div>


      {/* TABLE */}

      <section className="complaint-table-card">


        {/* TOOLBAR */}

        <div className="complaint-toolbar">

          <div className="complaint-search">

            <Search size={17} />

            <input
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="
                Search registered complaints,
                residents, flats...
              "
            />

          </div>


          <div className="complaint-filters">

            {filters.map((filter) => (

              <button
                key={filter}
                className={
                  activeFilter === filter
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>

            ))}

          </div>

        </div>


        {/* CONTENT */}

        {loading ? (

          <div className="complaint-empty">

            <div className="admin-spinner" />

            <p>
              Loading registered complaints...
            </p>

          </div>

        ) : filteredComplaints.length === 0 ? (

          <div className="complaint-empty">

            <div className="complaint-empty-icon">

              <MessageSquareWarning
                size={26}
              />

            </div>


            <h3>

              {complaints.length === 0
                ? 'No registered complaints yet'
                : 'No complaints match this filter'}

            </h3>


            <p>

              {complaints.length === 0
                ? 'When a resident submits a complaint, it will appear here automatically.'
                : 'Try another status or search term.'}

            </p>

          </div>

        ) : (

          <div className="complaint-list">

            {filteredComplaints.map(
              (item) => {

                const residentName =
                  item.resident?.name ||
                  'Resident';

                const flat =
                  item.resident?.flat
                    ? `${item.resident.flat.wing}-${item.resident.flat.flatNumber}`
                    : 'Flat not assigned';

                return (

                  <button
                    key={item._id}
                    className="complaint-row"
                    onClick={() =>
                      setSelectedComplaint(item)
                    }
                  >

                    <div className="complaint-row-icon">

                      <MessageSquareWarning
                        size={18}
                      />

                    </div>


                    <div className="complaint-row-main">

                      <span className="complaint-ref">

                        {item.referenceNumber ||
                          item._id}

                      </span>


                      <strong>
                        {item.title}
                      </strong>


                      <p>
                        {item.description}
                      </p>


                      <small>

                        <CalendarDays
                          size={12}
                        />

                        {new Date(
                          item.createdAt
                        ).toLocaleString()}

                      </small>

                    </div>


                    <div className="complaint-row-meta">

                      <span className="meta-label">
                        RESIDENT
                      </span>

                      <strong>
                        {residentName}
                      </strong>

                      <span>
                        {flat}
                      </span>

                    </div>


                    <div className="complaint-row-meta">

                      <span className="meta-label">
                        CATEGORY
                      </span>

                      <span>
                        {item.category}
                      </span>

                    </div>


                    <div>

                      <span
                        className={
                          `priority-badge ${
                            String(
                              item.priority
                            ).toLowerCase()
                          }`
                        }
                      >
                        {item.priority}
                      </span>

                    </div>


                    <div>

                      <span
                        className={
                          `status-badge ${
                            String(
                              item.status
                            )
                              .toLowerCase()
                              .replace(
                                ' ',
                                '-'
                              )
                          }`
                        }
                      >

                        {statusIcon(
                          item.status
                        )}

                        {item.status}

                      </span>

                    </div>


                    <ChevronRight
                      className="complaint-row-arrow"
                      size={18}
                    />

                  </button>

                );

              }
            )}

          </div>

        )}


        <div className="complaint-footer">

          Showing{' '}

          <strong>
            {filteredComplaints.length}
          </strong>

          {' '}of{' '}

          <strong>
            {complaints.length}
          </strong>

          {' '}registered complaints

        </div>

      </section>


      {/* DETAIL MODAL */}

      {selectedComplaint && (

        <div
          className="complaint-modal-backdrop"
          onClick={() =>
            setSelectedComplaint(null)
          }
        >

          <section
            className="complaint-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="complaint-modal-close"
              onClick={() =>
                setSelectedComplaint(null)
              }
            >
              <X size={20} />
            </button>


            <span className="admin-subpage-kicker">

              <MessageSquareWarning
                size={14}
              />

              COMPLAINT DETAILS

            </span>


            <h2>
              {selectedComplaint.title}
            </h2>


            <p className="complaint-modal-ref">

              {selectedComplaint.referenceNumber ||
                selectedComplaint._id}

            </p>


            <div className="complaint-detail-grid">

              <div>

                <span>
                  Resident
                </span>

                <strong>

                  <UserRound size={15} />

                  {selectedComplaint
                    .resident?.name ||
                    'Resident'}

                </strong>

              </div>


              <div>

                <span>
                  Flat
                </span>

                <strong>

                  {selectedComplaint
                    .resident?.flat
                    ? `${selectedComplaint.resident.flat.wing}-${selectedComplaint.resident.flat.flatNumber}`
                    : 'Not assigned'}

                </strong>

              </div>


              <div>

                <span>
                  Category
                </span>

                <strong>
                  {selectedComplaint.category}
                </strong>

              </div>


              <div>

                <span>
                  Priority
                </span>

                <strong>
                  {selectedComplaint.priority}
                </strong>

              </div>


              <div>

                <span>
                  Status
                </span>

                <strong>
                  {selectedComplaint.status}
                </strong>

              </div>


              <div>

                <span>
                  Created
                </span>

                <strong>

                  {new Date(
                    selectedComplaint.createdAt
                  ).toLocaleString()}

                </strong>

              </div>

            </div>


            <div className="complaint-description-box">

              <span>
                Description
              </span>

              <p>
                {selectedComplaint.description}
              </p>

            </div>


            <button
              className="admin-primary-button"
              onClick={() =>
                navigate('/admin/complaints')
              }
            >
              Back to complaints
            </button>

          </section>

        </div>

      )}

    </div>

  );
};


export default AdminComplaintsPage;