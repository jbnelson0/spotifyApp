/*******************
    GENERAL UTILITY FUNCTIONS
********************/

function reqParam() {
    throw new Error('This is a required param!');
}

(function() { // protect the lemmings!

    // this will just check to make sure
    // user input is not all empty
    const validateSearch = (value) => {
        return new Promise((resolve, reject) => {
            if (value.trim() === "") {
                reject('Input a value');
            }

            resolve(value);
        });
    };

    // this will add a track to the search results view
    const addTrackToHTML = (track) => {
        const {name, preview_url, id, album} = track;
        const imageUrl = album.images[1].url;

        // ^^^^ simpler version of the below set of lines
        // const name = track.name
        // const preview_url = track.preview_url
        // const id = track.id
        // const album = track.album

        // add the generate HTML contents to the search results div
        const div = document.createElement('div');
        div.classList.add('ui', 'card', 'dimmable');
        div.innerHTML = getCardMarkup(name, preview_url, id, album, imageUrl, false);;
        results.appendChild(div);

        div.addEventListener('click',() => {
            PlaylistManager.addTrack(track);
            const currentIndex = PlaylistManager.tracks.length - 1;
            // console.log(currentIndex);

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

            // get the AUDIO tag
            const audio = playlistTrack.querySelector('audio');

            audio.addEventListener('play', () => {
                PlaylistManager.currentSong = currentIndex;
            });

            audio.addEventListener('ended', () => {
                console.log('done!')
                const nextTrackId = PlaylistManager.getNextSong();

                setTimeout(() => {
                    document.querySelector(`.trackid-${nextTrackId} audio`).play();
                }, 1000);
                
            })


            // get the CLOSE button
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
        // console.log(html)
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
                <a class="header">${name}</a>
                <div class="meta">${album.name}</div>
                <div class="description">
                    <audio controls class="${id}" style="width: 100%;">
                        <source src="${preview_url}">
                    </audio>
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
                console.log('about to search for: ', query);

                input.value = '';
                input.setAttribute('disabled', 'disabled');
                button.setAttribute('disabled', 'disabled');


                return SpotifyAPI.search(query);

            })
            .then((data) => {
                console.log(data)
                // bring back the input fields
                input.removeAttribute('disabled');
                button.removeAttribute('disabled');
                // clear search results
                results.innerHTML = "";
                // append new results
                const tracks = data.tracks.items;
                for(const track of tracks) {
                    addTrackToHTML(track);
                }

            })
            .catch((e) => {
                alert(e);
            });
    }



    /***

        PROGRAM STARTS HERE

    ***/

    button.addEventListener('click', (e) => runSearchQuery());
    // ^^^^ shortcuts
    input.addEventListener('keydown', (e) => {
        const {keyCode, which} = e;
        // ^^^^ equivalent to: const keyCode = e.keyCode
        //                     const which = e.which
        // this is called object destructuring #es6

        if (keyCode === 13 || which === 13) {
           runSearchQuery();
        }
    });


})();
