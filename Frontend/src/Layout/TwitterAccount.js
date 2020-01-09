import React from 'react';
import { Link } from 'react-router-dom';
import qs from 'query-string';
import * as Cookies from "js-cookie";

export default class Twitter_account extends React.Component  {
    handleTwitterAnswer() {
        console.log(this.props);
        let token = require('query-string').parse(this.props.location.search).oauth_token;
        let verifier = require('query-string').parse(this.props.location.search).oauth_verifier;
        const url = 'https://localhost:5001/api/User/SaveTwitterUser/' +
            'oauth_token=' + token +
            '&oauth_verifier=' + verifier;
        const headers = new Headers();
        const requestOptions = {
            method: 'GET',
            headers
        };
        const request = new Request(url, requestOptions);

        fetch(request).then(function (response) {
            return response.text().then(function (text) {
                let user = JSON.parse(text);
                console.log(user);
                console.log(user.email);
                Cookies.remove("session");
                Cookies.set("session", { "email": user.email, "password": user.social_id, "social_login": user.social_platform }, { expires: 14 });
                Cookies.set("access_token", "placeholder", { expires: 14 });
                window.close();
            });
        });
        

        /*const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Access-Control-Allow-Origin', 'http://localhost/3000');
        const requestOptions = {
            method: 'GET',
            headers
        };
        const request = new Request(url, requestOptions);

        fetch(request).then(function (response) {
            return response.text().then(function (text) {
                
            });
        });
        */
    }

    render() {
        return (
            <div>
                {this.handleTwitterAnswer()}
                <h1>Handling Twitter Oauth!</h1>
            </div>
        );
    }
}