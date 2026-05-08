/* =============================================
   STATURE MANAGEMENT — Supabase Integration
   Database: Artists, Tour Dates, Albums
   Storage: Artist Photos, Hero Images, Artwork
   ============================================= */

(function () {
    'use strict';

    /* =========================================
       SUPABASE CONFIGURATION
       ========================================= */
    const SUPABASE_URL = 'https://ssqhraxyjkzzfdwvifze.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcWhyYXh5amt6emZkd3ZpZnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTQxNzEsImV4cCI6MjA5MzgzMDE3MX0.6uMNR5q3gkuuMfK8XrBokiDDP7bTm4r3j4xXZN8krQg';

    let supabase = null;

    function initSupabase() {
        if (supabase) return supabase;
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            return supabase;
        }
        console.warn('Supabase SDK not loaded.');
        return null;
    }

    /* =========================================
       FETCH ALL ARTISTS
       ========================================= */
    async function fetchAllArtists() {
        const client = initSupabase();
        if (!client) return [];
        try {
            const { data, error } = await client
                .from('artists')
                .select('*')
                .order('featured', { ascending: false })
                .order('name', { ascending: true });
            if (error) { console.error('Error fetching artists:', error.message); return []; }
            return data || [];
        } catch (err) {
            console.error('Unexpected error:', err);
            return [];
        }
    }

    async function renderArtistRoster(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="artist-roster-grid">
                <div style="grid-column: 1 / -1; text-align: center; padding: 80px 0; color: #8e9192;">
                    <span class="material-symbols-outlined" style="font-size: 2rem; display: block; margin-bottom: 12px;">hourglass_top</span>
                    <span style="font-family: 'Manrope', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">Loading Artists</span>
                </div>
            </div>
        `;

        const artists = await fetchAllArtists();

        if (artists.length === 0) {
            container.innerHTML = `
                <div class="artist-roster-grid">
                    <div style="grid-column: 1 / -1; text-align: center; padding: 80px 0; color: #8e9192;">
                        <span class="material-symbols-outlined" style="font-size: 2rem; display: block; margin-bottom: 12px;">group_off</span>
                        <span style="font-family: 'Manrope', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">No artists available yet</span>
                    </div>
                </div>
            `;
            return;
        }

        let html = '<div class="artist-roster-grid">';
        artists.forEach(function (artist) {
            const photoUrl = artist.photo_url || '';
            const slug = artist.slug || '';
            const name = artist.name || 'Unknown Artist';
            const genre = artist.genre || 'Artist';

            html += `
                <a href="artists/profile.html?slug=${encodeURIComponent(slug)}" class="artist-card">
                    <div class="artist-card-image">
                        <img src="${photoUrl}" alt="${name}" loading="lazy" />
                    </div>
                    <div class="artist-card-body">
                        <h3 class="artist-card-name">${escapeHtml(name)}</h3>
                        <span class="artist-card-genre">${escapeHtml(genre)}</span>
                    </div>
                </a>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }

    /* =========================================
       FETCH SINGLE ARTIST
       ========================================= */
    async function fetchArtistBySlug(slug) {
        const client = initSupabase();
        if (!client) return null;
        try {
            const { data, error } = await client
                .from('artists')
                .select('*')
                .eq('slug', slug)
                .single();
            if (error) { console.error('Error fetching artist:', error.message); return null; }
            return data;
        } catch (err) {
            console.error('Unexpected error:', err);
            return null;
        }
    }

    /* =========================================
       FETCH TOUR DATES
       ========================================= */
    async function fetchTourDates(artistId) {
        const client = initSupabase();
        if (!client) return [];
        try {
            const { data, error } = await client
                .from('tour_dates')
                .select('*')
                .eq('artist_id', artistId)
                .order('date', { ascending: true });
            if (error) { console.error('Error fetching tour dates:', error.message); return []; }
            return data || [];
        } catch (err) {
            console.error('Unexpected error:', err);
            return [];
        }
    }

    async function renderTourDates(artistId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 40px 0; color: #8e9192;">
                <span class="material-symbols-outlined" style="font-size: 1.5rem; display: block; margin-bottom: 8px;">schedule</span>
                <span style="font-family: 'Manrope', sans-serif; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;">Loading tour dates</span>
            </div>
        `;

        const dates = await fetchTourDates(artistId);

        if (dates.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 0; color: #8e9192;">
                    <span class="material-symbols-outlined" style="font-size: 1.5rem; display: block; margin-bottom: 8px;">event_busy</span>
                    <span style="font-family: 'Manrope', sans-serif; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em;">No upcoming tour dates</span>
                </div>
            `;
            return;
        }

        const months = {};
        dates.forEach(function (d) {
            const dateObj = new Date(d.date);
            const monthKey = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            if (!months[monthKey]) months[monthKey] = [];
            months[monthKey].push(d);
        });

        let html = '';
        Object.keys(months).forEach(function (month) {
            html += `
                <div class="month-divider"></div>
                <span style="font-family: 'Manrope', sans-serif; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.7rem; font-weight: 700; color: #e9c176; display: block; margin-bottom: 20px;">${month}</span>
            `;
            months[month].forEach(function (d) {
                const dateObj = new Date(d.date);
                const day = dateObj.getDate();
                const dayName = dateObj.toLocaleString('en-US', { weekday: 'short' });
                const ticketUrl = d.ticket_url || '#';
                const soldOut = d.sold_out || false;
                const venue = d.venue || 'TBA';
                const city = d.city || 'TBA';
                const badgeHtml = soldOut
                    ? '<span class="tour-badge tour-badge-sold">Sold Out</span>'
                    : '<span class="tour-badge tour-badge-available">Tickets</span>';

                html += `
                    <a href="${soldOut ? '#' : ticketUrl}" target="_blank" rel="noopener" class="tour-row" style="display: flex; text-decoration: none; color: inherit;">
                        <div style="display: flex; align-items: center; gap: 24px;">
                            <div class="tour-date-block">
                                <span class="tour-date-day">${day}</span>
                                <span class="tour-date-month">${dayName}</span>
                            </div>
                            <div>
                                <h4 class="tour-venue-name">${escapeHtml(venue)}</h4>
                                <p class="tour-city">${escapeHtml(city)}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            ${badgeHtml}
                            <span class="material-symbols-outlined" style="color: #c4c7c7; font-size: 1.2rem;">arrow_forward</span>
                        </div>
                    </a>
                `;
            });
        });

        container.innerHTML = html;
    }

    /* =========================================
       FETCH ALBUMS
       ========================================= */
    async function fetchAlbums(artistId) {
        const client = initSupabase();
        if (!client) return [];
        try {
            const { data, error } = await client
                .from('albums')
                .select('*')
                .eq('artist_id', artistId)
                .order('year', { ascending: false });
            if (error) { console.error('Error fetching albums:', error.message); return []; }
            return data || [];
        } catch (err) {
            console.error('Unexpected error:', err);
            return [];
        }
    }

// FIXED: Using discography-grid class with inline style to force grid
async function renderAlbums(artistId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const albums = await fetchAlbums(artistId);

    if (albums.length === 0) {
        container.innerHTML = `
            <div class="discography-empty">
                <span class="material-symbols-outlined">library_music</span>
                <p>No albums released yet</p>
            </div>
        `;
        return;
    }

    // FORCE the grid with inline styles
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(4, 1fr)';
    container.style.gap = '24px';
    
    let html = '';
    albums.forEach(function (album) {
        const artwork = album.artwork_url || '';
        const title = album.title || 'Untitled';
        const year = album.year || '';
        const type = album.type || 'Album';

        html += `
            <div class="discography-item" style="background: #111111; border: 1px solid rgba(255,255,255,0.05); padding: 24px 20px; text-align: center;">
                ${artwork ?
                    `<img src="${artwork}" alt="${escapeHtml(title)}" style="width: 100%; aspect-ratio: 1; object-fit: cover; margin-bottom: 20px;" loading="lazy" />` :
                    `<div style="width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #1a1a1a, #0a0a0a); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; border-radius: 4px;">
                        <span class="material-symbols-outlined" style="font-size: 3rem; color: #e9c176; opacity: 0.4;">album</span>
                    </div>`
                }
                <h4 style="font-family: 'Epilogue', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 8px;">${escapeHtml(title)}</h4>
                <span style="font-family: 'Manrope', sans-serif; text-transform: uppercase; font-size: 0.6rem; letter-spacing: 0.1em; color: #e9c176;">${escapeHtml(type)} • ${year}</span>
            </div>
        `;
    });
    container.innerHTML = html;
}

    // Helper function to escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    /* =========================================
       EXPORT
       ========================================= */
    window.StatureDB = {
        fetchAllArtists: fetchAllArtists,
        renderArtistRoster: renderArtistRoster,
        fetchArtistBySlug: fetchArtistBySlug,
        fetchTourDates: fetchTourDates,
        renderTourDates: renderTourDates,
        fetchAlbums: fetchAlbums,
        renderAlbums: renderAlbums,
        initSupabase: initSupabase
    };

})();