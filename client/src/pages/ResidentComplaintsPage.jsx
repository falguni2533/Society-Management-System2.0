import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import complaintService from '../services/complaintService';

import {
  AlertCircle,
  Plus,
  Clock3,
  CheckCircle2,
  X,
  Loader2,
  Wrench,
  Zap,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  ArrowUpRight,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

import './ResidentComplaintsPage.css';

const ResidentComplaintsPage = () => {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Plumbing',
    priority: 'Medium',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /* -----------------------------------------
     FETCH COMPLAINTS
  ----------------------------------------- */

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const res = await complaintService.getMyComplaints();

      if (res.success) {
        setComplaints(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  /* -----------------------------------------
     FORM
  ----------------------------------------- */

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError('');
  };

  const openComplaintModal = () => {
    setFormError('');
    setIsModalOpen(true);
  };

  const closeComplaintModal = () => {
    if (!submitting) {
      setIsModalOpen(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError(
        'Please provide a title and a detailed description of the issue.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const res = await complaintService.createComplaint(formData);

      if (res.success) {
        setSuccessMessage('Your complaint has been submitted successfully.');

        setFormData({
          title: '',
          description: '',
          category: 'Plumbing',
          priority: 'Medium',
        });

        setIsModalOpen(false);

        await fetchComplaints();

        setTimeout(() => {
          setSuccessMessage('');
        }, 4000);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          'Unable to submit complaint. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* -----------------------------------------
     CATEGORY ICON
  ----------------------------------------- */

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Plumbing':
        return <Wrench size={17} />;

      case 'Electrical':
        return <Zap size={17} />;

      case 'Cleaning':
        return <Sparkles size={17} />;

      case 'Security':
        return <ShieldAlert size={17} />;

      default:
        return <HelpCircle size={17} />;
    }
  };

  /* -----------------------------------------
     STATUS
  ----------------------------------------- */

  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'sms-complaint-status resolved';

      case 'In Progress':
        return 'sms-complaint-status progress';

      default:
        return 'sms-complaint-status open';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle2 size={14} />;

      case 'In Progress':
        return <Clock3 size={14} />;

      default:
        return <AlertCircle size={14} />;
    }
  };

  /* -----------------------------------------
     PRIORITY
  ----------------------------------------- */

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'sms-priority high';

      case 'Low':
        return 'sms-priority low';

      default:
        return 'sms-priority medium';
    }
  };

  /* -----------------------------------------
     FILTER
  ----------------------------------------- */

  const filteredComplaints = useMemo(() => {
    if (statusFilter === 'All') {
      return complaints;
    }

    return complaints.filter(
      (complaint) => complaint.status === statusFilter
    );
  }, [complaints, statusFilter]);

  const countByStatus = (status) => {
    if (status === 'All') {
      return complaints.length;
    }

    return complaints.filter(
      (complaint) => complaint.status === status
    ).length;
  };

  /* -----------------------------------------
     STATS
  ----------------------------------------- */

  const openCount = complaints.filter(
    (item) => item.status === 'Open'
  ).length;

  const progressCount = complaints.filter(
    (item) => item.status === 'In Progress'
  ).length;

  const resolvedCount = complaints.filter(
    (item) => item.status === 'Resolved'
  ).length;

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */

  return (
    <div className="sms-complaints-page">

      {/* ======================================
          HERO
      ====================================== */}

      <section className="sms-complaints-hero">

        <div className="sms-complaints-hero-content">

          <div className="sms-complaints-eyebrow">
            <MessageSquare size={15} />
            RESIDENT SERVICES
          </div>

          <h2>
            Maintenance &amp;
            <span> Complaints</span>
          </h2>

          <p>
            Report an issue in your home or society and keep track of
            every request from one place.
          </p>

          <div className="sms-complaints-resident">
            <div className="sms-resident-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : 'R'}
            </div>

            <div>
              <span>Logged in as</span>
              <strong>{user?.name || 'Resident'}</strong>
            </div>
          </div>

        </div>

        <div className="sms-complaints-hero-art">

          <div className="sms-art-circle circle-one" />
          <div className="sms-art-circle circle-two" />

          <div className="sms-art-card">

            <div className="sms-art-icon">
              <Wrench size={24} />
            </div>

            <div>
              <strong>Society Support</strong>
              <span>We're here to help</span>
            </div>

            <CheckCircle2 size={20} />

          </div>

        </div>

      </section>


      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {successMessage && (
        <div className="sms-success-message">
          <div className="sms-success-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <strong>Complaint submitted</strong>
            <span>{successMessage}</span>
          </div>

          <button onClick={() => setSuccessMessage('')}>
            <X size={16} />
          </button>
        </div>
      )}


      {/* ======================================
          QUICK STATS
      ====================================== */}

      <section className="sms-complaint-stats">

        <div className="sms-stat-card">
          <div className="sms-stat-icon blue">
            <MessageSquare size={20} />
          </div>

          <div>
            <span>Total requests</span>
            <strong>{complaints.length}</strong>
          </div>
        </div>


        <div className="sms-stat-card">
          <div className="sms-stat-icon amber">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Open</span>
            <strong>{openCount}</strong>
          </div>
        </div>


        <div className="sms-stat-card">
          <div className="sms-stat-icon violet">
            <Clock3 size={20} />
          </div>

          <div>
            <span>In progress</span>
            <strong>{progressCount}</strong>
          </div>
        </div>


        <div className="sms-stat-card">
          <div className="sms-stat-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{resolvedCount}</strong>
          </div>
        </div>

      </section>


      {/* ======================================
          TOOLBAR
      ====================================== */}

      <section className="sms-complaints-toolbar">

        <div>
          <h3>Your requests</h3>

          <p>
            View and track maintenance issues reported by you.
          </p>
        </div>

        <button
          className="sms-new-complaint-button"
          onClick={openComplaintModal}
        >
          <Plus size={18} />
          Raise a complaint
          <ArrowUpRight size={16} />
        </button>

      </section>


      {/* ======================================
          FILTER
      ====================================== */}

      <div className="sms-complaint-filters">

        {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            className={
              statusFilter === tab
                ? 'sms-filter active'
                : 'sms-filter'
            }
            onClick={() => setStatusFilter(tab)}
          >
            {tab}
            <span>{countByStatus(tab)}</span>
          </button>
        ))}

      </div>


      {/* ======================================
          COMPLAINT LIST
      ====================================== */}

      {loading ? (

        <div className="sms-complaints-loading">

          <Loader2
            size={30}
            className="sms-loading-spinner"
          />

          <strong>Loading your requests...</strong>

          <span>
            Getting the latest society service information.
          </span>

        </div>

      ) : filteredComplaints.length === 0 ? (

        <div className="sms-empty-complaints">

          <div className="sms-empty-icon">
            <CheckCircle2 size={30} />
          </div>

          <h3>
            {statusFilter === 'All'
              ? 'No complaints yet'
              : `No ${statusFilter.toLowerCase()} complaints`}
          </h3>

          <p>
            Everything looks clear right now. If something needs
            attention in your home or society, you can report it here.
          </p>

          {statusFilter === 'All' && (
            <button
              className="sms-empty-button"
              onClick={openComplaintModal}
            >
              <Plus size={17} />
              Report an issue
            </button>
          )}

        </div>

      ) : (

        <div className="sms-complaint-list">

          {filteredComplaints.map((complaint) => (

            <article
              key={complaint._id}
              className="sms-complaint-card"
              onClick={() => setSelectedComplaint(complaint)}
            >

              <div className="sms-complaint-card-top">

                <div className="sms-complaint-category">
                  <span>
                    {getCategoryIcon(complaint.category)}
                  </span>

                  {complaint.category}
                </div>

                <div className="sms-complaint-date">
                  {new Date(
                    complaint.createdAt
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>

              </div>


              <div className="sms-complaint-main">

                <div className="sms-complaint-title-row">

                  <h3>{complaint.title}</h3>

                  <ChevronRight
                    className="sms-complaint-arrow"
                    size={19}
                  />

                </div>

                <p>
                  {complaint.description}
                </p>

              </div>


              <div className="sms-complaint-footer">

                <div className="sms-complaint-badges">

                  <span className={getStatusClass(complaint.status)}>
                    {getStatusIcon(complaint.status)}
                    {complaint.status}
                  </span>

                  <span className={getPriorityClass(complaint.priority)}>
                    {complaint.priority} priority
                  </span>

                </div>

                {complaint.resolutionNote && (
                  <span className="sms-resolution-label">
                    Resolution available
                  </span>
                )}

              </div>


              {complaint.resolutionNote && (
                <div className="sms-resolution-preview">
                  <CheckCircle2 size={15} />

                  <span>
                    <strong>Admin update:</strong>{' '}
                    {complaint.resolutionNote}
                  </span>
                </div>
              )}

            </article>

          ))}

        </div>

      )}


      {/* ======================================
          CREATE COMPLAINT MODAL
      ====================================== */}

      {isModalOpen && (

        <div
          className="sms-modal-overlay"
          onMouseDown={closeComplaintModal}
        >

          <div
            className="sms-complaint-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >

            <div className="sms-modal-header">

              <div>

                <div className="sms-modal-icon">
                  <MessageSquare size={20} />
                </div>

                <div>
                  <h3>Raise a complaint</h3>

                  <p>
                    Tell the society team what needs attention.
                  </p>
                </div>

              </div>

              <button
                className="sms-modal-close"
                onClick={closeComplaintModal}
              >
                <X size={19} />
              </button>

            </div>


            {formError && (

              <div className="sms-form-error">
                <AlertCircle size={17} />
                <span>{formError}</span>
              </div>

            )}


            <form
              className="sms-complaint-form"
              onSubmit={handleFormSubmit}
            >

              <div className="sms-form-group">

                <label>
                  Complaint title
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Water leakage in bathroom"
                  required
                />

              </div>


              <div className="sms-form-row">

                <div className="sms-form-group">

                  <label>
                    Category
                    <span>*</span>
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>

                </div>


                <div className="sms-form-group">

                  <label>
                    Priority
                    <span>*</span>
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                </div>

              </div>


              <div className="sms-form-group">

                <label>
                  Describe the issue
                  <span>*</span>
                </label>

                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe what happened, where it happened and any useful details for the maintenance team..."
                  required
                />

              </div>


              <div className="sms-form-info">

                <AlertCircle size={16} />

                <span>
                  Please provide enough detail so the society team can
                  resolve your request quickly.
                </span>

              </div>


              <div className="sms-modal-actions">

                <button
                  type="button"
                  className="sms-cancel-button"
                  onClick={closeComplaintModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sms-submit-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="sms-loading-spinner"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit complaint
                      <ArrowUpRight size={16} />
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================
          COMPLAINT DETAILS MODAL
      ====================================== */}

      {selectedComplaint && (

        <div
          className="sms-modal-overlay"
          onMouseDown={() => setSelectedComplaint(null)}
        >

          <div
            className="sms-detail-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >

            <div className="sms-detail-header">

              <div>
                <span className="sms-detail-category">
                  {selectedComplaint.category}
                </span>

                <h3>
                  {selectedComplaint.title}
                </h3>

                <p>
                  Submitted{' '}
                  {new Date(
                    selectedComplaint.createdAt
                  ).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <button
                className="sms-modal-close"
                onClick={() => setSelectedComplaint(null)}
              >
                <X size={19} />
              </button>

            </div>


            <div className="sms-detail-status-row">

              <span
                className={getStatusClass(
                  selectedComplaint.status
                )}
              >
                {getStatusIcon(selectedComplaint.status)}
                {selectedComplaint.status}
              </span>

              <span
                className={getPriorityClass(
                  selectedComplaint.priority
                )}
              >
                {selectedComplaint.priority} priority
              </span>

            </div>


            <div className="sms-detail-description">
              {selectedComplaint.description}
            </div>


            {selectedComplaint.resolutionNote && (

              <div className="sms-detail-resolution">

                <div className="sms-resolution-icon">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <strong>Admin resolution update</strong>

                  <p>
                    {selectedComplaint.resolutionNote}
                  </p>
                </div>

              </div>

            )}


            <div className="sms-detail-footer">

              <button
                className="sms-cancel-button"
                onClick={() => setSelectedComplaint(null)}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ResidentComplaintsPage;