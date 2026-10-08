import React, {
  useEffect,
  useState,
} from 'react';

import noticeService
  from '../services/noticeService';

import {
  Bell,
  Plus,
  Pin,
  CalendarDays,
  User,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import './AdminNoticesPage.css';


const AdminNoticesPage = () => {

  const [notices, setNotices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [formData, setFormData] =
    useState({
      title: '',
      content: '',
    });

  const [formError, setFormError] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');


  const fetchNotices = async () => {

    try {

      setLoading(true);

      const response =
        await noticeService.getNotices();

      if (response.success) {
        setNotices(
          response.data || []
        );
      }

    } catch (err) {

      setFormError(
        err.response?.data?.message ||
        'Failed to load notices.'
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchNotices();

  }, []);


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.content.trim()
    ) {

      setFormError(
        'Please enter both title and content.'
      );

      return;
    }


    try {

      setFormError('');

      const response =
        await noticeService.createNotice(
          formData
        );

      if (response.success) {

        setFormData({
          title: '',
          content: '',
        });

        setIsModalOpen(false);

        setSuccessMessage(
          'Notice published successfully.'
        );

        await fetchNotices();

        setTimeout(
          () =>
            setSuccessMessage(''),
          3500
        );

      }

    } catch (err) {

      setFormError(
        err.response?.data?.message ||
        'Failed to publish notice.'
      );

    }

  };


  const handleDelete = async (
    id,
    title
  ) => {

    if (
      !window.confirm(
        `Delete notice "${title}"?`
      )
    ) {
      return;
    }


    try {

      setDeletingId(id);

      const response =
        await noticeService.deleteNotice(
          id
        );

      if (response.success) {

        setSuccessMessage(
          'Notice deleted successfully.'
        );

        await fetchNotices();

        setTimeout(
          () =>
            setSuccessMessage(''),
          3500
        );

      }

    } catch (err) {

      setFormError(
        err.response?.data?.message ||
        'Failed to delete notice.'
      );

    } finally {

      setDeletingId(null);

    }

  };


  return (

    <div className="admin-notices-page">


      <div className="admin-subpage-header">

        <div>

          <span className="admin-subpage-kicker">

            <Bell size={14} />

            SOCIETY COMMUNICATION

          </span>


          <h1>
            Society Notices
          </h1>


          <p>
            Create and manage the actual
            announcements that residents receive.
          </p>

        </div>


        <button
          className="admin-primary-button"
          onClick={() => {

            setFormError('');

            setIsModalOpen(true);

          }}
        >

          <Plus size={17} />

          Publish Notice

        </button>

      </div>


      {successMessage && (

        <div className="notice-success">

          <CheckCircle2 size={18} />

          {successMessage}

        </div>

      )}


      {formError && !isModalOpen && (

        <div className="notice-error">

          <AlertCircle size={18} />

          {formError}

        </div>

      )}


      {loading ? (

        <div className="notice-empty">

          <Loader2
            className="notice-loader"
            size={30}
          />

          <p>
            Loading notices...
          </p>

        </div>

      ) : notices.length === 0 ? (

        <div className="notice-empty">

          <div className="notice-empty-icon">

            <Bell size={27} />

          </div>


          <h3>
            No active notices
          </h3>


          <p>
            There are no published notices yet.
            Publish the first real society
            announcement.
          </p>


          <button
            className="admin-primary-button"
            onClick={() =>
              setIsModalOpen(true)
            }
          >

            <Plus size={16} />

            Publish Notice

          </button>

        </div>

      ) : (

        <div className="notice-grid">

          {notices.map((notice) => (

            <article
              className="notice-card"
              key={notice._id}
            >

              <div className="notice-card-top">

                <span>

                  <Pin size={13} />

                  Published Circular

                </span>


                <time>

                  <CalendarDays size={13} />

                  {new Date(
                    notice.createdAt
                  ).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  )}

                </time>

              </div>


              <h2>
                {notice.title}
              </h2>


              <p>
                {notice.content}
              </p>


              <div className="notice-card-footer">

                <span>

                  <User size={14} />

                  {notice.createdBy?.name ||
                    'Administrator'}

                </span>


                <button
                  onClick={() =>
                    handleDelete(
                      notice._id,
                      notice.title
                    )
                  }
                  disabled={
                    deletingId ===
                    notice._id
                  }
                >

                  <Trash2 size={14} />

                  {deletingId ===
                  notice._id
                    ? 'Deleting...'
                    : 'Delete'}

                </button>

              </div>

            </article>

          ))}

        </div>

      )}


      {/* MODAL */}

      {isModalOpen && (

        <div
          className="notice-modal-backdrop"
          onClick={() =>
            setIsModalOpen(false)
          }
        >

          <section
            className="notice-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="notice-modal-close"
              onClick={() =>
                setIsModalOpen(false)
              }
            >
              <X size={20} />
            </button>


            <span className="admin-subpage-kicker">

              <Bell size={14} />

              PUBLISH NOTICE

            </span>


            <h2>
              Create society announcement
            </h2>


            <p>
              Published notices will be
              available through the resident
              notice board.
            </p>


            {formError && (

              <div className="notice-error">

                <AlertCircle size={16} />

                {formError}

              </div>

            )}


            <form onSubmit={handleSubmit}>

              <label>

                Notice title

                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title:
                        e.target.value,
                    })
                  }
                  placeholder="
                    e.g. Water tank maintenance
                  "
                />

              </label>


              <label>

                Notice content

                <textarea
                  rows="6"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      content:
                        e.target.value,
                    })
                  }
                  placeholder="
                    Write the announcement
                    for residents...
                  "
                />

              </label>


              <div className="notice-form-actions">

                <button
                  type="button"
                  className="admin-outline-button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  Publish Notice
                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </div>

  );
};


export default AdminNoticesPage;