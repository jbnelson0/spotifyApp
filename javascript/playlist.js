const PlaylistManager = {};

// top Store track IDs
PlaylistManager.tracks = [];

// Current Song index
PlaylistManager.currentSong = 0;

// add track to playlist
PlaylistManager.addTrack = (track = reqParam()) => {
    PlaylistManager.tracks.push(track);
};


PlaylistManager.removeById = (id) => {
    for (let i = 0; i < PlaylistManager.tracks.length; i++) {
        const track = PlaylistManager.tracks[i];
        if (track.id === id) {
            PlaylistManager.tracks.splice(i, 1);

            break;
        }
    }
}


PlaylistManager.getNextSong = () => {
    PlaylistManager.currentSong++;
    const {tracks, currentSong} = PlaylistManager;

    const length = tracks.length;
    if (currentSong === length) {
        PlaylistManager.currentSong = 0;
    }

    return tracks[PlaylistManager.currentSong].id;
}
