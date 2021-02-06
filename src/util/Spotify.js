const appClientID = '2ebbc6d1e47944aa8304036a13eca997';
const appRedirectURI = "http://alister.surge.sh";

let userAccessToken;

const Spotify = {

    getAccessToken(){
        if(userAccessToken){
            return userAccessToken;
        }
        const userAccessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if(userAccessTokenMatch && expiresInMatch){
            userAccessToken = userAccessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            window.setTimeout(() => userAccessToken = '', expiresIn*1000);
            window.history.pushState('Access Token', null, '/');
            return userAccessToken;
        }else{
            window.location = `https://accounts.spotify.com/authorize?client_id=${appClientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${appRedirectURI}`;
        }

    },

    search(term){
        const userAccessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${userAccessToken}`
            }
        }).then(response => {
            return response.json();
        }).then(jsonResponse =>{
            if (!jsonResponse.tracks){
                return [];
            }
            return jsonResponse.tracks.items.map(item => ({
                id: item.id, 
                name: item.name,
                artist: item.artists[0].name,
                album: item.album.name,
                uri: item.uri
            }));

        });
    },

    savePlaylist(name, trackURIs){
        if (!name || !trackURIs){
            return;
        }

        const userAccessToken = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${userAccessToken}`};
        let UserID;

        return fetch('https://api.spotify.com/v1/me', {headers: headers}
        ).then(response =>  response.json()
        ).then(jsonResponse => {
            UserID = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${UserID}/playlists`, {
                headers: headers, 
                method: 'POST', 
                body: JSON.stringify({name:name})
            }).then(response => response.json()
            ).then(jsonResponse =>{
                const playlistID = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${UserID}/playlists/${playlistID}/tracks`, {
                    headers: headers, 
                    method: 'POST', 
                    body: JSON.stringify({uri: trackURIs})
                });
            });
        });

    }
};

export default Spotify;