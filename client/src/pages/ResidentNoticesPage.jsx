import React, { useEffect, useState } from 'react';

import {
  Search,
  CalendarDays,
  ChevronRight,
  Megaphone,
  Info,
  Bell,
  Loader2,
} from 'lucide-react';

import noticeService from '../services/noticeService';

import './ResidentNoticesPage.css';


const ResidentNoticesPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');


  /*
  ============================================================
  LOAD REAL ADMIN-CREATED NOTICES
  ============================================================
  */

  const fetchNotices = async () => {
    try {
      setError('');

      const response = await noticeService.getNotices();

      if (response?.success) {
        setNotices(response.data || []);
      } else {
        setNotices([]);

        setError(
          response?.message ||
            'Unable to load society notices.'
        );
      }
    } catch (err) {
      console.error(
        'Failed to load notices:',
        err
      );

      setNotices([]);

      setError(
        err?.response?.data?.message ||
          'Unable to connect to the notice service.'
      );
    } finally {
      setLoading(false);
    }
  };


  /*
  ============================================================
  INITIAL LOAD + REFRESH
  ============================================================
  */

  useEffect(() => {
    fetchNotices();

    const handleFocus = () => {
      fetchNotices();
    };

    window.addEventListener(
      'focus',
      handleFocus
    );


    const interval = setInterval(() => {
      fetchNotices();
    }, 15000);


    return () => {
      window.removeEventListener(
        'focus',
        handleFocus
      );

      clearInterval(interval);
    };
  }, []);


  /*
  ============================================================
  FILTER NOTICES
  ============================================================
  */

  const filteredNotices = notices.filter(
    (notice) => {
      const searchText = search
        .trim()
        .toLowerCase();


      const noticeText = `
        ${notice?.title || ''}
        ${notice?.content || ''}
      `.toLowerCase();


      const matchesSearch =
        !searchText ||
        noticeText.includes(searchText);


      /*
      ALL NOTICES
      */

      if (activeCategory === 'All') {
        return matchesSearch;
      }


      /*
      IMPORTANT

      Uses the actual notice data created by
      the admin.

      No fake notices are generated.
      */

      if (activeCategory === 'Important') {
        return (
          notice?.important === true &&
          matchesSearch
        );
      }


      /*
      EVENTS

      Only notices whose real title/content
      contains event-related words are shown.
      */

      if (activeCategory === 'Events') {
        const eventKeywords = [
          'event',
          'festival',
          'celebration',
          'party',
          'function',
          'program',
          'programme',
          'diwali',
          'holi',
          'christmas',
          'independence',
        ];


        const matchesEvent =
          eventKeywords.some(
            (keyword) =>
              noticeText.includes(keyword)
          );


        return (
          matchesEvent &&
          matchesSearch
        );
      }


      return matchesSearch;
    }
  );


  /*
  ============================================================
  FEATURED NOTICE
  ============================================================
  */

  const featuredNotice =
    notices.length > 0
      ? notices[0]
      : null;


  /*
  ============================================================
  DATE FORMAT
  ============================================================
  */

  const getDateParts = (date) => {
    const parsedDate = new Date(date);


    if (
      !date ||
      Number.isNaN(parsedDate.getTime())
    ) {
      return {
        day: '--',
        month: 'DATE',
      };
    }


    return {
      day: parsedDate.getDate(),

      month: parsedDate
        .toLocaleDateString(
          'en-US',
          {
            month: 'short',
          }
        )
        .toUpperCase(),
    };
  };


  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="sms-notices-page">

        <div className="sms-notices-header">

          <div>

            <div className="sms-notices-kicker">
              <span />
              SOCIETY COMMUNICATION
            </div>

            <h1>
              Society Notices
            </h1>

            <p>
              Stay informed about everything
              happening around your community.
            </p>

          </div>

        </div>


        <div className="sms-notices-loading">

          <Loader2
            className="sms-notices-loading-icon"
            size={30}
          />

          <h3>
            Loading society notices...
          </h3>

          <p>
            Checking for announcements
            published by society management.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="sms-notices-page">


      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="sms-notices-header">

        <div>

          <div className="sms-notices-kicker">
            <span />
            SOCIETY COMMUNICATION
          </div>

          <h1>
            Society Notices
          </h1>

          <p>
            Stay informed about everything
            happening around your community.
          </p>

        </div>


        {/* SEARCH */}

        <div className="sms-notice-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="sms-notices-error">

          <Info size={19} />

          <div>

            <strong>
              Unable to load notices
            </strong>

            <p>
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={fetchNotices}
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================================
          FEATURED REAL NOTICE
      ====================================================== */}

      {featuredNotice && (

        <div className="sms-featured-notice">

          <div className="sms-featured-content">

            <div className="sms-featured-badge">

              <Megaphone size={13} />

              LATEST SOCIETY UPDATE

            </div>


            <h2>
              {featuredNotice.title}
            </h2>


            <p>
              {featuredNotice.content}
            </p>


            <div className="sms-featured-meta">

              <span>

                <CalendarDays size={14} />

                {new Date(
                  featuredNotice.createdAt
                ).toLocaleDateString(
                  'en-US',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }
                )}

              </span>


              <span>

                <Bell size={14} />

                {featuredNotice.createdBy?.name ||
                  'Society Management'}

              </span>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          NO REAL NOTICES
      ====================================================== */}

      {!loading &&
        notices.length === 0 &&
        !error && (

          <div className="sms-notices-real-empty">

            <div className="sms-notices-real-empty-icon">

              <Bell size={30} />

            </div>

            <h2>
              No society notices yet
            </h2>

            <p>
              There are currently no announcements
              published by society management.
            </p>

            <span>
              New notices published by the admin
              will appear here automatically.
            </span>

          </div>

        )}


      {/* =====================================================
          NOTICE CONTENT
      ====================================================== */}

      {notices.length > 0 && (

        <div className="sms-notices-layout">


          {/* =================================================
              NOTICE LIST
          ================================================== */}

          <div className="sms-notices-panel">


            {/* PANEL HEADER */}

            <div className="sms-notices-panel-header">

              <div>

                <h2>
                  Latest Notices
                </h2>

                <p>
                  Official announcements from
                  society management
                </p>

              </div>


              {/* TOP FILTERS */}

              <div className="sms-notice-tabs">

                <button
                  type="button"
                  className={`sms-notice-tab ${
                    activeCategory === 'All'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveCategory('All')
                  }
                >
                  All
                </button>


                <button
                  type="button"
                  className={`sms-notice-tab ${
                    activeCategory === 'Important'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveCategory('Important')
                  }
                >
                  Important
                </button>


                <button
                  type="button"
                  className={`sms-notice-tab ${
                    activeCategory === 'Events'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveCategory('Events')
                  }
                >
                  Events
                </button>

              </div>

            </div>


            {/* =================================================
                NOTICE RESULTS
            ================================================== */}

            {filteredNotices.length > 0 ? (

              <div className="sms-notice-list">

                {filteredNotices.map(
                  (notice) => {

                    const dateParts =
                      getDateParts(
                        notice.createdAt
                      );


                    return (

                      <div
                        className="sms-notice-card"
                        key={notice._id}
                      >


                        {/* DATE */}

                        <div className="sms-notice-date">

                          <strong>
                            {dateParts.day}
                          </strong>

                          <span>
                            {dateParts.month}
                          </span>

                        </div>


                        {/* NOTICE CONTENT */}

                        <div className="sms-notice-main">

                          <div className="sms-notice-top">

                            <span className="sms-notice-title">
                              {notice.title}
                            </span>

                            <span className="sms-notice-tag">
                              Society Notice
                            </span>

                          </div>


                          <p className="sms-notice-description">
                            {notice.content}
                          </p>


                          <div className="sms-notice-bottom">

                            <span>
                              {notice.createdBy?.name ||
                                'Society Management'}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              Official Notice
                            </span>

                          </div>

                        </div>


                        <ChevronRight
                          size={20}
                          className="sms-notice-arrow"
                        />

                      </div>

                    );
                  }
                )}

              </div>

            ) : (

              <div className="sms-notices-empty">

                <div className="sms-notices-empty-icon">

                  <Search size={27} />

                </div>


                <h3>
                  No matching notices
                </h3>


                <p>
                  There are no published society
                  notices matching your current
                  search or filter.
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              RIGHT INFORMATION CARD
          ================================================== */}

          <div className="sms-notices-side">

            <div className="sms-notice-info">

              <div className="sms-notice-info-icon">

                <Info size={19} />

              </div>


              <h3>
                Stay connected
              </h3>


              <p>
                Check this page regularly for
                society meetings, maintenance
                schedules, safety notices and
                community announcements.
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


export default ResidentNoticesPage;