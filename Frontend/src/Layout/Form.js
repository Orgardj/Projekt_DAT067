import React from 'react';
import ALink from './ALink';
import UserIcon from '../Image/user-512.png';
import PasswordIcon from '../Image/password.ico';
import Recaptcha from 'react-recaptcha';
import EyeIcon from '../Image/icon-eye-7.jpg';
import * as Cookies from "js-cookie";

import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import logo from '../Image/CIAM-logo.png';
import TwitterIcon from '../Image/twitter.png';
import FacebookIcon from '../Image/facebook.png';
import GoogleIcon from '../Image/google.png';
import LinkdinIcon from '../Image/linkdin.png';

import { Link } from 'react-router-dom';
import registeredPage from './registeredPage';
import { withRouter } from 'react-router-dom';

import { bool } from 'prop-types';

import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';     //'react-facebook-login';
import GoogleLogin from 'react-google-login';
import TwitterLogin from 'react-twitter-login';
// import LinkedIn from "linkedin-login-for-react";
import { LinkedIn } from 'react-linkedin-login-oauth2';

class form extends React.Component {

    constructor(props) {
        super(props);

        this.myRef = React.createRef();

        this.recaptchaLoaded = this.recaptchaLoaded.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        // this.handleLogin = this.handleLogin.bind(this);

        this.verifyCallback = this.verifyCallback.bind(this);

        this.state = {
            fields: {},
            errors: {},
            isVerified: false,
            snackbaropen: false,
            snackbarmsg: '',
            visible: true,
            loginForm: true,
            registerForm: false,
            registerCompleted: false,
            forgotpass: false,
            code: '',
            errorMessage: '',
        }

        this.handleChange = this.handleChange.bind(this);
        this.submituserRegistrationForm = this.submituserRegistrationForm.bind(this);
        this.submituserLoginForm = this.submituserLoginForm.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);

    };

    recaptchaLoaded() {
        console.log("Captcha loaded successfully!");
    }

    verifyCallback(response) {
        if (response) {
            this.setState({
                isVerified: true
            })
        }
    }
    handleRegister(e) {
        if (!this.state.isVerified) {
            //Hindrar att formuläret submitas   JE
            this.setState({
                snackbaropen: true,
                snackbarmsg: "Please verify that you are a human"
            })
        }
    }

    snackbarClose = (event) => {
        this.setState({ snackbaropen: false });
    }

    handleChange(e) {

        let fields = this.state.fields;
        fields[e.target.name] = e.target.value;
        this.validateForm();
        this.setState({
            fields
        });
    }

    submituserRegistrationForm(e) {
        e.preventDefault()
        let _this = this;
        if (this.validateForm()) {
            let user = {};
            user["email"] = this.state.fields.email;
            user["password"] = this.state.fields.password;
            user["first_name"] = this.state.fields.firstname;
            user["last_name"] = this.state.fields.lastname;

            var randomstring = require("randomstring");
            user["token"] = randomstring.generate();

            let fields = {};
            fields["firstname"] = "";
            fields["lastname"] = "";
            fields["email"] = "";
            fields["password"] = "";
            fields["ConfirmPassword"] = "";

            const url = 'https://localhost:5001/api/User/SaveUser';
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const requestOptions = {
                method: 'POST',
                headers,
                body: JSON.stringify(user)
            };
            const request = new Request(url, requestOptions);

             //lägga in om man inte kunde registrera
             //visa fel
             fetch(request).then(function (response) {
                 return response.text().then(function (text) {
                     console.log(text);
                     if (text === "true") {
                        _this.setState({
                            fields: fields,
                            snackbaropen: true,
                            snackbarmsg: "Registration successful!",
                            visible: false,
                            loginForm: false, 
                            registerForm: false, 
                            registerCompleted: true
                        })
                    }//den går in i else när användaren är reggad ändå, antagligen för att den inte skickar mail från just denna datorn
                     else {
                           _this.setState({
                           fields: fields,
                            snackbaropen: true,
                            snackbarmsg: "Unsuccessful registration. Mail is probably already taken",
                            visible: true,
                        });
                    }
                });
            });

            //this.redirect('/registeredPage');
        }

    }

    socialLogin(platform) {
        let _this = this;
        let user = {};
        user["email"] = this.state.fields.email;
        user["first_name"] = this.state.fields.firstname;
        user["last_name"] = this.state.fields.lastname;
        user["social_platform"] = platform;
        user["social_id"] = this.state.fields.password;

        let fields = {};
        fields["firstname"] = "";
        fields["lastname"] = "";
        fields["email"] = "";
        fields["password"] = "";
        fields["ConfirmPassword"] = "";

        const url = 'https://localhost:5001/api/User/SaveSocialUser';
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const requestOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(user)
        };
        const request = new Request(url, requestOptions);

        fetch(request).then(function (response) {
            return response.text().then(function (text) {
                if (user.email) {
                    Cookies.remove("session");
                    Cookies.set("session", { "email": user.email, "password": user.social_id, "social_login": platform }, { expires: 14 });
                    Cookies.set("access_token", "placeholder", { expires: 14 });
                    _this.setState({
                        snackbaropen: true,
                        snackbarmsg: "Login successful!"
                    });
                    window.location.reload();
                }
                else {
                    _this.setState({
                        snackbaropen: true,
                        snackbarmsg: "Login failed"
                    });
                }
            });
        });
    }
    
    //seems to be a small bug with recaptcha
    //nothing very important
    forgotPassword(e){
        e.preventDefault();
        let _this = this;
           var mail = this.state.fields.email;

           let fields = {};
           fields["firstname"] = "";
           fields["lastname"] = "";
           fields["email"] = "";
           fields["password"] = "";
           fields["ConfirmPassword"] = "";

        if(mail != null){
            const url = 'https://localhost:5001/api/User/resetPassword/' + mail;
            const requestOptions = {
                method: 'GET'
            };
            const request = new Request(url, requestOptions);
           fetch(request).then(function (response) {
            return response.text().then(function (text) {
                if (text === "true") {

                    _this.setState({
                        fields: fields,
                        snackbaropen: true,
                        snackbarmsg: "Check your email to change Password",
                        visible: false,
                        forgotpass: false
                    })

                }
                else {
                       _this.setState({
                       fields: fields,
                        snackbaropen: true,
                        snackbarmsg: "Unsuccessful request for changing password. Mail doesn't probably exist",
                        visible: true
                    });
                }
            });
        });
        }
        /*
    this.setState({
        forgotpass : false
    })
    */
    }


    //Listener to login button(when pressed)
    handleLogin() {
        const mail = this.state.fields.email;
        const url = 'https://localhost:5001/api/User/CheckUser/' + mail;
    }

    redirect(path) {
        this.props.history.push(path)
    }

    //Listener to login button(when pressed)
    submituserLoginForm(e) {
        e.preventDefault();
        let _this = this;

        let user = {};
        user["email"] = this.state.fields.email;
        user["password"] = this.state.fields.password;

        const url = 'https://localhost:5001/api/User/LoginUser';
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const requestOptions = {
            method: 'POST',
            headers,
            body: JSON.stringify(user)
        };
        const request = new Request(url, requestOptions);

        fetch(request).then(function (response) {
            return response.text().then(function (text) {
                if (text === "true") {
                    const url = 'https://localhost:5001/api/User/CheckUser/' + user.email;
                    const requestOptions = {
                        method: 'GET'
                    };
                    const request = new Request(url, requestOptions);
                    fetch(request).then(function (response) {
                        return response.text().then(function (text) {
                            if (text === "true") {
                                Cookies.remove("session");
                                Cookies.set("session", { "email": user.email, "password": user.password }, { expires: 14 });
                                Cookies.set("access_token", "placeholder", { expires: 14 });
                                _this.setState({
                                    snackbaropen: true,
                                    snackbarmsg: "Login successful!"
                                });
                                window.location.reload();
                                //_this.redirect('/loginPage');
                            }
                            else {
                                _this.setState({
                                    snackbaropen: true,
                                    snackbarmsg: "Account not verified, please check you email"
                                });
                            }
                        });
                    });
                }
                else {
                    _this.setState({
                        snackbaropen: true,
                        snackbarmsg: "Wrong email or password"
                    });
                }
            });
        });
    }


    validateForm() {
        let fields = this.state.fields;
        let errors = {};
        let formIsValid = true;

        if (fields["password"] != null) {
            if (!fields["password"].match(/(?=.{8,})/)) {
                formIsValid = false;
                errors["password"] = "The password must be at least 8 characters";
            }
            else if (!fields["password"].match(/(?=.*[a-z])/)) {
                formIsValid = false;
                errors["password"] = "Must have at least one lowercase";
            }
            else if (!fields["password"].match(/(?=.*[A-Z])/)) {
                formIsValid = false;
                errors["password"] = "Must have at least one uppercase";
            }
            else if (!fields["password"].match(/(?=.*[ !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])/)) {
                formIsValid = false;
                errors["password"] = "Must have at least one special character";
            }
            else if (!fields["password"].match(/(?=.*[0-9])/)) {
                formIsValid = false;
                errors["password"] = "Must have at least one number";
            }
            else if (!(fields["ConfirmPassword"] === fields["password"])) {
                formIsValid = false;
                errors["ConfirmPassword"] = "The passwords must match";
            }
            else if (!this.state.isVerified) {
                formIsValid = false;
            }
        }
        else {
            formIsValid = false;
        }

        this.setState({
            errors: errors
        });

        return formIsValid;

    };

    state = {
        isPasswordShown: false
    }

    togglePasswordVisiblity = () => {
        const { isPasswordShown } = this.state;
        this.setState({
            isPasswordShown: !isPasswordShown
        });
    }

    render() {

        const { isPasswordShown } = this.state;
        const children = this.props.children;

        const responseFacebook = (response) => {
            console.log(response);
            this.state.fields.email = response.email;
            this.state.fields.password = response.id;
            let facebook_name = response.name.split(" ");
            this.state.fields.firstname = facebook_name[0];
            this.state.fields.lastname = facebook_name[facebook_name.length - 1];
            this.socialLogin("facebook");
        }

        const responseGoogle = (response) => {
            console.log(response);
            this.state.fields.email = response.w3.U3;
            this.state.fields.password = response.googleId;
            this.state.fields.firstname = response.w3.ofa;
            this.state.fields.lastname = response.w3.wea;
            this.socialLogin("google");
        }

        const responseTwitter = (err, data) => {
            console.log(err, data);
            window.location.reload();
        }

        const callbackLinkedIn = (error, code, redirectUri) => {
            if (error) {
                // signin failed
            } else {
                // Obtain authorization token from linkedin api
                // see https://developer.linkedin.com/docs/oauth2 for more info
            }
        };

        const loginFailed= () => {
            this.setState({
                snackbaropen: true,
                snackbarmsg: "Login failed"
            });
        }
            
        //if forgotPassword was pressed render this
         if(this.state.forgotpass === true){
          return(  <div className="cover">
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={this.state.snackbaropen}
                autoHideDuration={3000}
                onClose={this.snackbarClose}
                message={<span id="message-id">{this.state.snackbarmsg}</span>}
                action={[
                    <IconButton
                        key="close"
                        aria-label="Close"
                        color="inherit"
                        onClick={this.snackbarClose}
                    >
                        x
                    </IconButton>
                ]}
            />
            <form method="get" name="forgotPasswordForm" onSubmit={ this.forgotPassword}>
                {
                    React.Children.map(children, (child, i) => {
                    //Ignore the first child
                    if (i === 1) return
                        return child
                    })
                }
                <h3>Put in your email</h3>
                <div>
                    <img src={UserIcon} alt="UserIcon" />
                    <input type="email"
                        name="email"
                        placeholder="E-mail" required
                        value={this.state.fields.email}
                        onChange={this.handleChange}
                    />
                </div>
                <button onClick={this.handleRegister} >Change Password</button>

                <Recaptcha
                    className="reCapcha"
                    sitekey="6LfWBMQUAAAAAFoGa1-TI5r-Mj0dH5rOQXgXyl5L"
                    render="explicit"
                    onloadCallback={this.recaptchaLoaded}
                    verifyCallback={this.verifyCallback}
                />
            </form>




        </div>
          )}

        if (this.props.form === "Login") {
            return (
                <div className="cover">
                    <Snackbar
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        open={this.state.snackbaropen}
                        autoHideDuration={3000}
                        onClose={this.snackbarClose}
                        message={<span id="message-id">{this.state.snackbarmsg}</span>}
                        action={[
                            <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                onClick={this.snackbarClose}
                            >
                                x
                            </IconButton>
                        ]}
                    />
                    <form method="post" name="userLoginForm" onSubmit={this.submituserLoginForm}>
                        {
                            React.Children.map(children, (child, i) => {
                            //Ignore the first child
                            if (i === 1) return
                                return child
                            })
                        }
                        <h3>Please {this.props.form}</h3>
                        <div>
                            <img src={UserIcon} alt="UserIcon" />
                            <input type="email"
                                name="email"
                                placeholder="E-mail" required
                                value={this.state.fields.email}
                                onChange={this.handleChange}
                            />
                        </div>
                        <div>
                            <img src={PasswordIcon} alt="PasswordIcon" />
                            <input type={(isPasswordShown) ? "text" : "password"}
                                className="form-conntrol"
                                name="password"
                                placeholder="Password" required
                                value={this.state.fields.password}
                                onChange={this.handleChange}
                            />
                            <img className="eyeIcon"
                                onClick={this.togglePasswordVisiblity}
                                src={EyeIcon} alt="EyeIcon" />
                        </div>
                        <button>Login</button>

                        <Recaptcha
                            className="reCapcha"
                            sitekey="6LfWBMQUAAAAAFoGa1-TI5r-Mj0dH5rOQXgXyl5L"
                            render="explicit"
                            onloadCallback={this.recaptchaLoaded}
                            verifyCallback={this.verifyCallback}
                        />

                        <footer onClick = {()=>  this.setState({forgotpass : true })}>
                            <ALink href="true" value="Forgot Password?" />
                        </footer>
                    </form>
                </div>
            )
        }
        else if (this.props.form === "Register") {
            return (

                <div className="cover">
                    <Snackbar
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        open={this.state.snackbaropen}
                        autoHideDuration={3000}
                        onClose={this.snackbarClose}
                        message={<span id="message-id">{this.state.snackbarmsg}</span>}
                        action={[
                            <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                onClick={this.snackbarClose}
                            >
                                x
                            </IconButton>
                        ]}
                    />

                    {this.state.visible ?
                        <form method="post" className="userRegistrationForm" name="userRegistrationForm" onSubmit={this.submituserRegistrationForm}>

                            {
                                React.Children.map(children, (child, i) => {
                                //Ignore the second child
                                if (i === 1) return
                                    return child
                                })
                            }

                            <h3>{this.props.form}</h3>

                            <FacebookLogin
                                appId="681003465986574"
                                fields="name,email,picture"
                                callback={responseFacebook}
                            />
                            

                            <GoogleLogin
                                clientId="159392247202-jakk3kn43aib2ur606fvu9jc1gtus913.apps.googleusercontent.com"
                                buttonText="Login"
                                onSuccess={responseGoogle}
                                onFailure={loginFailed}
                                cookiePolicy={'single_host_origin'}
                            />

                            <TwitterLogin
                                authCallback={responseTwitter}
                                consumerKey={"nJrY5ioXoNAP27qfW32E3V5Gs"}
                                consumerSecret={"T1CWdHZfeI2SwPyha0bKZGTzgu6ssElfKJ2OiYhiJoHt9xC0Pv"}
                                callbackUrl={"http://localhost:3000/TwitterAccount"}
                            />
                                                  
                            <div>
                                <input type="text"
                                    className="inputDesignFirstname"
                                    name="firstname"
                                    placeholder="Firstname *" required
                                    value={this.state.fields.firstname}
                                    onChange={this.handleChange}
                                />

                            </div>
                            <div>
                                <input type="text"
                                    className="inputDesignLastname"
                                    name="lastname"
                                    placeholder="Lastname *" required
                                    value={this.state.fields.lastname}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div>
                                <input type="email"
                                    name="email"
                                    className="inputDesignEmail"
                                    placeholder="E-mail address *" required
                                    value={this.state.fields.email}
                                    onChange={this.handleChange}
                                />
                            </div>

                            <div>
                                <input type="password"
                                    className="inputDesignPassword"
                                    name="password"
                                    placeholder="Password *" required
                                    value={this.state.fields.password}
                                    onChange={this.handleChange}
                                    onBlur={this.handleChange}
                                />
                                <p className="errorMsg">{this.state.errors.password}</p>
                            </div>

                            <div>
                                <input type="password"
                                    className="inputDesignConfirmPassword"
                                    name="ConfirmPassword"
                                    placeholder="Confirm Password *" required
                                    value={this.state.fields.ConfirmPassword}
                                    onChange={this.handleChange}
                                    onBlur={this.handleChange}
                                />
                                <p className="errorMsg">{this.state.errors.ConfirmPassword}</p>

                            </div>
                            <button onClick={this.handleRegister}>Create account</button>

                            <Recaptcha
                                className="reCapcha"
                                sitekey="6LfWBMQUAAAAAFoGa1-TI5r-Mj0dH5rOQXgXyl5L"
                                render="explicit"
                                onloadCallback={this.recaptchaLoaded}
                                verifyCallback={this.verifyCallback}
                            />
                        </form>
                    :
                    <div className="registrationCompleted">

                            <div className="logoDesign">
                                <Link to="/#">
                            <img src={logo} alt="logo"       />
                                </Link>
                            </div>

                            <div className="divDesign">
                                <h2 className="messageDesign">Thank you for registering!</h2>
                                <h2 className="messageDesign2">An email with a link to activate your account has been sent to you.</h2>
                            </div>

                            <div className="divDesign">
                            {
                                React.Children.map(children, (child, i) => {
                                //Ignore the first child
                                if (i === 0) return
                                    return child
                                })
                            }
                            </div>
                    </div>
                    }
                </div>
            )
        }

        else if (this.props.form === "LogAndReg") {
            return (

                <div className="cover">
                    <Snackbar
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        open={this.state.snackbaropen}
                        autoHideDuration={3000}
                        onClose={this.snackbarClose}
                        message={<span id="message-id">{this.state.snackbarmsg}</span>}
                        action={[
                            <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                onClick={this.snackbarClose}
                            >
                                x
                            </IconButton>
                        ]}
                    />

                    <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    open={this.state.snackbaropen}
                    autoHideDuration={3000}
                    onClose={this.snackbarClose}
                    message={<span id="message-id">{this.state.snackbarmsg}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            onClick={this.snackbarClose}
                        >
                            x
                        </IconButton>
                    ]}
                    />

                    {this.state.loginForm === true ?
                        <form method="post" name="userLoginForm" onSubmit={this.submituserLoginForm}>
                            <article>
                                {
                                    React.Children.map(children, (child, i) => {
                                    //Ignore the first child
                                    if (i === 1) return
                                        return child
                                    })
                                }
                                <h3>Your CIAM ID</h3>

                                <p className="pageSwitch pageSwitchActive" onClick={() => { this.setState({ loginForm: true, registerForm: false, registerCompleted: false}); }}>Login</p>
                                <p className="pageSwitch" onClick={() => { this.setState({ loginForm: false, registerForm: true, registerCompleted: false}); }}>Register</p>

                                <div>
                                    <input type="email"
                                        name="email"
                                        placeholder="E-mail" required
                                        value={this.state.fields.email}
                                        onChange={this.handleChange}
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <input type={(isPasswordShown) ? "text" : "password"}
                                        className="form-conntrol"
                                        name="password"
                                        placeholder="Password" required
                                        value={this.state.fields.password}
                                        onChange={this.handleChange}
                                    />
                                    <img className="eyeIcon"
                                        onClick={this.togglePasswordVisiblity}
                                        src={EyeIcon} alt="EyeIcon" />
                                </div>
                                <button>Login</button>
{/*
                                <Recaptcha
                                    className="reCapcha"
                                    sitekey="6LfWBMQUAAAAAFoGa1-TI5r-Mj0dH5rOQXgXyl5L"
                                    render="explicit"
                                    onloadCallback={this.recaptchaLoaded}
                                    verifyCallback={this.verifyCallback}
                                />
*/}

                                <p className="orSocial">Or continue with</p>

                                <GoogleLogin
                                    ref={input => { this.myInput = input; }}
                                    clientId="159392247202-jakk3kn43aib2ur606fvu9jc1gtus913.apps.googleusercontent.com"
                                    render={renderProps => (
                                        <img src={GoogleIcon} onClick={renderProps.onClick} disabled={renderProps.disabled} className="socialAuthentication" alt="Google social authentication" />
                                    )}
                                    buttonText="Login"
                                    onSuccess={responseGoogle}
                                    onFailure={loginFailed}
                                    cookiePolicy={'single_host_origin'}
                                />
                                <FacebookLogin
                                    appId="681003465986574"
                                    fields="name,email,picture"
                                    callback={responseFacebook}
                                    render={renderPropss => (
                                        <img src={FacebookIcon} onClick={renderPropss.onClick} disabled={renderPropss.disabled} className="socialAuthentication" alt="Facebook social authentication" />
                                    )}
                                />
                                <img src={TwitterIcon} className="socialAuthentication" alt="Twitter social authentication" />
                                <LinkedIn
                                    clientId="86wtuouhirmnef"
                                    onFailure={this.handleFailure}
                                    onSuccess={this.handleSuccess}
                                    redirectUri={"http://localhost:3000/LinkedInAccount"}
                                    scope="r_emailaddress r_liteprofile "
                                    renderElement={({ onClick, disabled }) => (
                                        <img src={LinkdinIcon} onClick={onClick} className="socialAuthentication" alt="Linkdin social authentication" />
                                    )}
                                >
                                </LinkedIn>
                                <TwitterLogin
                                    style={{ width: '100%' }}
                                    authCallback={responseTwitter}
                                    consumerKey={"nJrY5ioXoNAP27qfW32E3V5Gs"}
                                    consumerSecret={"T1CWdHZfeI2SwPyha0bKZGTzgu6ssElfKJ2OiYhiJoHt9xC0Pv"}
                                    callbackUrl={"http://localhost:3000/TwitterAccount"}
                                    children={<img src={TwitterIcon} className="socialAuthentication" alt="Twitter social authentication" />}
                                />
                                {/*<img src={LinkdinIcon} className="socialAuthentication" alt="Linkdin social authentication" />*/}
                            </article>

                            <footer onClick={() => this.setState({ forgotpass: true })}>
                                <ALink href="true" value="Forgot Password?" />
                            </footer>
                        </form>
                    :
                        null
                    }


                    {this.state.registerForm === true ?

                        <form method="post" className="userRegistrationForm" name="userRegistrationForm" onSubmit={this.submituserRegistrationForm}>

                            {
                                React.Children.map(children, (child, i) => {
                                //Ignore the second child
                                if (i === 1) return
                                    return child
                                })
                            }

                            <h3>Your CIAM ID</h3>

                            <p className="pageSwitch" onClick={() => { this.setState({ loginForm: true, registerForm: false, registerCompleted: false}); }}>Login</p>
                            <p className="pageSwitch pageSwitchActive" onClick={() => { this.setState({ loginForm: false, registerForm: true, registerCompleted: false}); }}>Register</p>


                            <div>
                                <input type="text"
                                    className="inputDesignFirstname"
                                    name="firstname"
                                    placeholder="Firstname *" required
                                    value={this.state.fields.firstname}
                                    onChange={this.handleChange}
                                    autoFocus
                                />

                            </div>
                            <div>
                                <input type="text"
                                    className="inputDesignLastname"
                                    name="lastname"
                                    placeholder="Lastname *" required
                                    value={this.state.fields.lastname}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <div>
                                <input type="email"
                                    name="email"
                                    className="inputDesignEmail"
                                    placeholder="E-mail address *" required
                                    value={this.state.fields.email}
                                    onChange={this.handleChange}
                                />
                            </div>

                            <div>
                                <input type="password"
                                    className="inputDesignPassword"
                                    name="password"
                                    placeholder="Password *" required
                                    value={this.state.fields.password}
                                    onChange={this.handleChange}
                                    onBlur={this.handleChange}
                                />
                                <p className="errorMsg">{this.state.errors.password}</p>
                            </div>

                            <div>
                                <input type="password"
                                    className="inputDesignConfirmPassword"
                                    name="ConfirmPassword"
                                    placeholder="Confirm Password *" required
                                    value={this.state.fields.ConfirmPassword}
                                    onChange={this.handleChange}
                                    onBlur={this.handleChange}
                                />
                                <p className="errorMsg">{this.state.errors.ConfirmPassword}</p>

                            </div>

                            <p className="termsOffCondition">
                                <input type="checkbox" name="termsOffCondition" value="Terms off condition" />
                                Terms Off Condition
                            </p>

                            <button onClick={this.handleRegister}>Create account</button>

                            <Recaptcha
                                className="reCapcha"
                                sitekey="6LfWBMQUAAAAAFoGa1-TI5r-Mj0dH5rOQXgXyl5L"
                                render="explicit"
                                onloadCallback={this.recaptchaLoaded}
                                verifyCallback={this.verifyCallback}
                            />

                            <p className="orSocial">Or continue with</p>

                            <GoogleLogin
                                ref={input => { this.myInput = input; }}
                                clientId="159392247202-jakk3kn43aib2ur606fvu9jc1gtus913.apps.googleusercontent.com"
                                render={renderProps => (
                                    <img src={GoogleIcon} onClick={renderProps.onClick} disabled={renderProps.disabled} className="socialAuthentication" alt="Google social authentication" />
                                )}
                                buttonText="Login"
                                onSuccess={responseGoogle}
                                onFailure={loginFailed}
                                cookiePolicy={'single_host_origin'}
                            />
                            <FacebookLogin
                                appId="681003465986574"
                                fields="name,email,picture"
                                callback={responseFacebook}
                                render={renderPropss => (
                                    <img src={FacebookIcon} onClick={renderPropss.onClick} disabled={renderPropss.disabled} className="socialAuthentication" alt="Facebook social authentication" />
                                )}
                            />
                            <TwitterLogin
                                authCallback={responseTwitter}
                                consumerKey={"nJrY5ioXoNAP27qfW32E3V5Gs"}
                                consumerSecret={"T1CWdHZfeI2SwPyha0bKZGTzgu6ssElfKJ2OiYhiJoHt9xC0Pv"}
                                callbackUrl={"http://localhost:3000/TwitterAccount"}
                            />
                            <img src={TwitterIcon} className="socialAuthentication" alt="Twitter social authentication" />
                            <img src={LinkdinIcon} className="socialAuthentication" alt="Linkdin social authentication" />
                        </form>
                    :
                        null
                    }
                    {this.state.forgotpass === true ?
                        <div className="cover">
                            <Snackbar
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                open={this.state.snackbaropen}
                                autoHideDuration={3000}
                                onClose={this.snackbarClose}
                                message={<span id="message-id">{this.state.snackbarmsg}</span>}
                                action={[
                                    <IconButton
                                        key="close"
                                        aria-label="Close"
                                        color="inherit"
                                        onClick={this.snackbarClose}
                                    >
                                        x
                    </IconButton>
                                ]}
                            />
                            <form method="get" name="forgotPasswordForm" onSubmit={this.forgotPassword}>
                                {
                                    React.Children.map(children, (child, i) => {
                                        //Ignore the first child
                                        if (i === 1) return
                                        return child
                                    })
                                }
                                <h3>Put in your email</h3>
                                <div>
                                    <img src={UserIcon} alt="UserIcon" />
                                    <input type="email"
                                        name="email"
                                        placeholder="E-mail" required
                                        value={this.state.fields.email}
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <button onClick={this.handleRegister} >Change Password</button>

                                <Recaptcha
                                    className="reCapcha"
                                    sitekey="6LfWBMQUAAAAAFoGa1-TI5r-Mj0dH5rOQXgXyl5L"
                                    render="explicit"
                                    onloadCallback={this.recaptchaLoaded}
                                    verifyCallback={this.verifyCallback}
                                />
                            </form>
                        </div>
                        :
                        null
                        }
                    {this.state.registerCompleted === true ?
                        <div className="registrationCompleted">

                                <div className="logoDesign">
                                    <Link to="/">
                                <img src={logo} alt="logo"       />
                                    </Link>
                                </div>

                                <div className="divDesign">
                                    <h2 className="messageDesign">Thank you for registering!</h2>
                                    <p className="messageDesign2">An email with a link to activate your account has been sent to you.</p>
                                </div>

                                <div className="divDesign">
                                {/*
                                    React.Children.map(children, (child, i) => {
                                    //Ignore the first child
                                    if (i === 0) return
                                        return child
                                    })
                                    */

                                <p className="linkDesign" onClick={() => { this.setState({ loginForm: !this.state.loginForm, registerForm: false, registerCompleted: !this.state.registerCompleted}); }}>Click here to login</p>
                                }
                                </div>
                                
                            <p className="bottomText">CIAM</p>
                        </div>
                    :
                        null
                        }
                    }
                </div>
            )
        }
    }
}

export default withRouter(form);
