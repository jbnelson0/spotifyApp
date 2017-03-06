function reqParam() {
    throw new Error('This is a required param!');
}

(function() {

    const validateSearch = (value) => {
        return new Promise((resolve, reject) => {
            if (value.trim() === "") {
                reject('Input a value');
            }

            resolve(value);
        });
    };

    // add tracks to search results
    const addTrackToHTML = (track) => {
        const {name, preview_url, id, album} = track;
        const imageUrl = album.images[1].url;

        // add results to div
        const div = document.createElement('div');
        div.classList.add('ui', 'card', 'dimmable');
        div.innerHTML = getCardMarkup(name, preview_url, id, album, imageUrl, false);
        results.appendChild(div);
        const addBtn = div.querySelector('.js-add-button')

        addBtn.addEventListener('click',() => {
            PlaylistManager.addTrack(track);
            const currentIndex = PlaylistManager.tracks.length - 1;

            const playlistTrack = document.createElement('div');
            playlistTrack.classList.add('ui', 'card', 'trackid-' + id);
            playlistTrack.innerHTML = `
                <div class="item playlist-track trackid-${id}">
                    <a href="#" class="playlist-close js-playlist-close">
                        <i class="icon remove"></i>
                    </a>
                    <div class="ui tiny image">
                      <img src="${imageUrl}">
                    </div>
                    <div class="middle aligned content playlist-content">
                      ${name}
                    </div>
                </div>
                        <audio controls style="width: 100%;">
                            <source src="${preview_url}">
                        </audio>
            `
            playlist.appendChild(playlistTrack)

            // AUDIO
            const audio = playlistTrack.querySelector('audio');

            audio.addEventListener('play', () => {
                PlaylistManager.currentSong = currentIndex;
            });

            audio.addEventListener('ended', () => {
                const nextTrackId = PlaylistManager.getNextSong();

                setTimeout(() => {
                    document.querySelector(`.trackid-${nextTrackId} audio`).play();
                }, 1000);
                
            })


            // CLOSE
           const closeBtn = playlistTrack.querySelector('.js-playlist-close');
           closeBtn.addEventListener('click', () => {
                if (PlaylistManager.currentSong === currentIndex) {
                    const nextTrackId = PlaylistManager.getNextSong();

                    setTimeout(() => {
                        document.querySelector(`.trackid-${nextTrackId} audio`).play();
                    }, 500);
                }
                PlaylistManager.removeById(id);

                playlist.removeChild(playlistTrack);
           })

        })
    }

    const button = document.querySelector('.js-search');
    const input = document.querySelector('.js-input');
    const results = document.querySelector('.js-searchresult');
    const playlist = document.querySelector('.js-playlist');

    const getCardMarkup = (name, preview_url, id, album, imageUrl, isDimmed) => {
        let html = `
                <div class="image">
                    <img src="${imageUrl}">
                </div>
                <div class="content">
                    <div class="header">${name}</div>
                    <div class="meta">${album.name}</div>
                    <div class="description">
                        <audio controls class="${id}" style="width: 100%;">
                            <source src="${preview_url}">
                        </audio>
                    </div>
                    <div>
                        <i class="icon add circle icon add-btn js-add-button">Add to Playlist</i>
                    </div>
                </div>
        `;
        if (isDimmed) {
            html += `<div class="ui dimmer transition visible active" style="display: block !important;"></div>`;
        }

        return html;
    }
    const runSearchQuery = () => {
        const {value} = input;

        validateSearch(value)
            .then((query) => {
                input.value = '';
                input.setAttribute('disabled', 'disabled');
                button.setAttribute('disabled', 'disabled');

                return SpotifyAPI.search(query);

            })
            .then((data) => {
                input.removeAttribute('disabled');
                button.removeAttribute('disabled');
                // clear results
                results.innerHTML = "";
                // add new results
                const tracks = data.tracks.items;
                for(const track of tracks) {
                    addTrackToHTML(track);
                }

            })
            .catch((e) => {
                alert(e);
            });
    }


    button.addEventListener('click', (e) => runSearchQuery());
    input.addEventListener('keydown', (e) => {
        const {keyCode, which} = e;
        if (keyCode === 13 || which === 13) {
           runSearchQuery();
        }
    });


})();
