import React, { Component } from "react";
import jwt_decode from "jwt-decode";
// import { Link } from "react-router-dom";
import API from "../../utils/API"
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import M from "materialize-css";
import Nav from "../Nav"
import "./style.css"

class Profile extends Component {
    constructor() {
        super();
        this.state = {
            id: "",
            first_name: "",
            last_name: "",
            email: "",
            bio: "",
            date_of_birth: "",
            remote: "",
            inperson: "",
            subjects: [],
            profileImage: "",
            file: "",
            address: "",
            lat: "",
            lng: "",
            lastclickedoption: []
        }
    }
    componentDidMount() {
        const token = localStorage.userToken;
        const decoded = jwt_decode(token)
        const email = decoded.email;
        this.setState({
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            email: decoded.email
        })

        M.AutoInit();
        
        API.getOneTutor(email)
            .then(tutor => 
                this.setState({
                id: tutor.data.id,
                bio: tutor.data.bio,
                date_of_birth: tutor.data.date_of_birth,
                remote: tutor.data.remote,
                inperson: tutor.data.inperson,
                subjects: tutor.data.subjects ? tutor.data.subjects.split(",") : [],
                profileImage: tutor.data.profileImage,
                address: tutor.data.address,
                lat: tutor.data.lat,
                lng: tutor.data.lng
            }, function(){
                console.log("updated state",this.state)
            })
            )
            .catch(err => console.log(err));
    }

    logOut=e=>{
        e.preventDefault();
        localStorage.removeItem("userToken");
        window.location.href="/";
    }

    onChangeImage = e => {
        this.setState({file: e.target.files}, function(){
            console.log(this.state.file[0])
        })
    }

    onClickImage = e => {
        e.preventDefault();
      var id = this.state.id;
        const formData = new FormData();
        formData.append('file', this.state.file[0]);
        API.postImage(formData).then(response => {
           API.updateTutor(id, {profileImage: response.data.Location}).then(res=>console.log(res))
        this.setState({profileImage:response.data.Location})
        }).catch(error => {
            console.log(error)
          // handle your error
        });
    }

    onChangeBio = (e) => {
        var value = e.target.value;
        this.setState({ bio: value })
    }

    onClickBio = (e) => {
        e.preventDefault();
        var id = this.state.id;
        var data = {
            bio: this.state.bio
        }
        API.updateTutor(id, data)
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }

    onChangeSubjects = (e) => {
        var options = e.target.options;
        var value = [];
        for (var i = 0; i < options.length; i++){
            if(options[i].selected){
                value.push(options[i].value);
            }
        }
        this.setState({subjects:value});
    }
    onClickSubjects = (e) => {
        e.preventDefault();
        var id = this.state.id;
        var mysubjects = this.state.subjects
        console.log("current subjects", mysubjects);
        var data = {
            subjects: mysubjects.join(",")
        }
        API.updateTutor(id, data)
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }


    onChangePersonal = e => {
        var name = e.target.name;
        var value = e.target.value;

        this.setState({ [name]: value }, function(){
            console.log("onchangepersonal",this.state)
        });
    }

    onClickPersonal = e => {
        e.preventDefault();
        var id = this.state.id;
        var data = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            date_of_birth: this.state.date_of_birth,
            remote: this.state.remote,
            inperson: this.state.inperson,
            address: this.state.address,
            lat: this.state.lat,
            lng: this.state.lng
        }
        console.log(data, "going to db")
        
        API.updateTutor(id, data)
            .then(res => console.log(res))
            .then(API.getFromGeo(this.state.address).then(res => { 
                console.log(res.data, "is this a decimal")
               var data2 = {
                lat: res.data.results[0].geometry.location.lat,
                lng: res.data.results[0].geometry.location.lng,
               }
                API.updateTutor(id, data2).then(res => console.log(res))
                .catch(err => console.log(err))
            }));
            console.log(this.state.address, "in updatetutor")
    }
           
    render() {
        return (

            <div class ="profile-wrapper">
                <Nav />
                <section className="section">
                    <div className="container ">
                        <div className="row">
                            <div className="col s4 ">
                                <div className="card hoverable round-border">
                                    <div className="card-image">
                                        <img src={this.state.profileImage ? this.state.profileImage : "https://via.placeholder.com/150"} alt="profileImage"/>
                                        <span className="card-title white-text">{this.state.first_name}{" "}{this.state.last_name}</span>
                                        <form action="">
                                            <div className="file-field">
                                                {/* Modal button */}
                                                <a className="btn-floating halfway-fab waves-light light-blue darken-4 modal-trigger" href="#modal0"><i className="material-icons">edit</i></a>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="col s4"></div>
                        </div>
                    </div>
                </section>
                {/* This is the Image Section */}
                <section className="section">
                    {/* Modal Structure */}
                    <div id="modal0" className="modal">
                        <div className="modal-content">
                            <h4>Profile Picture</h4>
                            <form >
                                <div className="row">
                                    <div className="file-field input-field">
                                        <div className="btn">
                                            <span>UPLOAD</span>
                                        <input label='upload file' 
                                        type='file' 
                                        name="profileImage" 
                                        onChange={this.onChangeImage} />
                                          <button type='submit'>    </button>
                                        </div>
                                        <div className="file-path-wrapper">
                                            <input className="file-path validate" type="text"></input>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                        <button className="btn waves-effect waves-light light-blue darken-4 modal-close"
                                type="submit"
                                name="action"
                                value={this.state.id}
                                onClick={this.onClickImage}>Submit
                                <i className="material-icons right">send</i>
                            </button>{" "}
                            <button href="#!" className="modal-close btn waves-effect  light-blue darken-4">Close</button>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col hide-on-small-only m1"></div>
                        <div className="col s12 m10">
                            <div className="card-panel white hoverable">
                                {/* Modal button */}
                                <div className="right-align "><a className="btn-floating waves-light light-blue darken-4 modal-trigger" href="#modal1"><i className="material-icons">edit</i></a></div>
                                {/* Modal Structure */}
                                <div id="modal1" className="modal">
                                    <div className="modal-content">
                                        <h4>About you</h4>
                                        <form action="">
                                            <div className="row">
                                                <div className="input-field col s12">
                                                    <input id="bio"
                                                        type="text"
                                                        className="validate"
                                                        name="bio"
                                                        value={this.state.bio}
                                                        onChange={this.onChangeBio}
                                                    ></input>
                                                    <label htmlFor="bio" className="active">Tell us a little about yourself!</label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                    <button className="btn waves-effect waves-light light-blue darken-4 modal-close"
                                                type="submit"
                                                name="action"
                                                value={this.state.id}
                                                onClick={this.onClickBio}>Submit
                                                 <i className="material-icons right">send</i>
                                            </button> {" "}
                                        <button href="#!" className="modal-close btn waves-effect  light-blue darken-4">Close</button>
                                    </div>
                                </div>
                                <span className="black-text"><strong>About me</strong>
                                </span>
                                <div className="divider"></div>
                                <p>{this.state.bio}</p>
                            </div>
                        </div>
                        <div className="col hide-on-small-only m1"></div>
                    </div>
                    <div className="row">
                        <div className="col hide-on-small-only m1"></div>
                        <div className="col s12 m5">
                            <div className="card-panel white hoverable cardheigh">
                                {/* Modal button */}
                                <div className="right-align"><a className="btn-floating waves-light light-blue darken-4 modal-trigger" href="#modal2"><i className="material-icons">edit</i></a></div>
                                {/* Modal Structure */}
                                <div id="modal2" className="modal modal-fixed-footer">
                                    <div className="modal-content">
                                        <h4>Subjects</h4>
                                        <form action="">
                                            <div className="row">
                                                <div className="input-field col s12">
                                                    <select multiple
                                                        id="subjects"
                                                        onChange={this.onChangeSubjects}
                                                        value={this.state.subjects}
                                                    >
                                                        <option disabled={true} value="">Choose an option</option>
                                                        <option value="Mathematics">Mathematics</option>
                                                        <option value="Science" >Science</option>
                                                        <option value="Music">Music</option>
                                                        <option value="Art">Art</option>
                                                        <option value="English">English</option>
                                                        <option value="Other-Languages">Other Languages</option>
                                                        <option value="Social Studies">Social Studies</option>
                                                        <option value="History">History</option>
                                                        <option value="Health">Health</option>
                                                    </select>
                                                    <label>What subjects do you feel comfortable teaching?</label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn waves-effect waves-light light-blue darken-4 modal-close"
                                            type="submit"
                                            name="action"
                                            onClick={this.onClickSubjects}>Submit
                                                 <i className="material-icons right">send</i>
                                        </button>
                                        {" "}
                                        <button href="#!" className="modal-close btn waves-effect  light-blue darken-4">Close</button>
                                    </div>
                                </div>
                                <span className="black-text"><strong>Area of knowledge</strong>
                                </span>
                                <div className="divider"></div>
                                <ul>
                                    {this.state.subjects.map(function (subject, i) {
                                        return (
                                            <li key={i} >{subject}</li>
                                        )
                                    }
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="col s12 m5">
                            <div className="card-panel white hoverable cardheigh">
                                {/* Modal button */}
                                <div className="right-align"><a className="btn-floating waves-light light-blue darken-4 modal-trigger" href="#modal3"><i className="material-icons">edit</i></a></div>
                                {/* Modal Structure */}
                                <div id="modal3" className="modal modal-fixed-footer">
                                    <div className="modal-content">
                                        <h4>Personal Information</h4>
                                        <form action="">
                                            <div className="row">
                                                <div className="input-field col s4">
                                                    <input id="first_name"
                                                        type="text"
                                                        className="validate"
                                                        name="first_name"
                                                        onChange={this.onChangePersonal}
                                                        value={this.state.first_name}
                                                    ></input>
                                                    <label htmlFor="first_name" className="active">First Name</label>
                                                </div>
                                                <div className="input-field col s4">
                                                    <input id="last_name"
                                                        type="text"
                                                        className="validate"
                                                        name="last_name"
                                                        onChange={this.onChangePersonal}
                                                        value={this.state.last_name}></input>
                                                    <label className="active" htmlFor="last_name">Last Name</label>
                                                </div>
                                                <div className="input-field col s4 browser-default">
                                                    <input id="date_of_birth"
                                                        type="date"
                                                        name="date_of_birth"
                                                        onChange={this.onChangePersonal}
                                                        value={this.state.Date_of_birth}></input>
                                                    <label htmlFor="date_of_birth">Birthdate</label>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="input-field col s6">
                                                    <select
                                                        name="remote"
                                                        onChange={this.onChangePersonal}
                                                        value={this.state.remote}>
                                                        <option value="">Choose an option</option>
                                                        <option value={true}>Yes</option>
                                                        <option value={false}>No</option>
                                                    </select>
                                                    <label>Are you available to tutor remotely (online)?</label>
                                                </div>
                                                <div className="input-field col s6">
                                                    <select
                                                        name="inperson"
                                                        onChange={this.onChangePersonal}
                                                        value={this.state.inperson}>
                                                        <option value="">Choose an option</option>
                                                        <option value={true}>Yes</option>
                                                        <option value={false}>No</option>
                                                    </select>
                                                    <label>Are you available to tutor in person?</label>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="input-field col s12">
                                                    <GooglePlacesAutocomplete
                                                        onSelect={({ description }) => (
                                                            this.setState({ address: description })
                                                        )}
                                                    />
                                                    <label htmlFor="address"></label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="modal-footer">
                                    <button className="btn waves-effect waves-light light-blue darken-4 modal-close"
                                                type="submit"
                                                name="action"
                                                onClick={this.onClickPersonal}>Submit
                                                 <i className="material-icons right">send</i>
                                            </button>{" "}
                                        <button href="#!" className="modal-close btn waves-effect  light-blue darken-4">Close</button>
                                    </div>
                                </div>
                                <span className="black-text"><strong>Personal Information</strong></span>
                                <div className="divider"></div>
                                    <p>Name: {this.state.first_name}{" "}{this.state.last_name}</p>
                                    <p>Date of birth: {this.state.date_of_birth }</p>
                                    <p>Remote sessions: {this.state.remote ? "Yes" : "No"}</p>
                                    <p>Presental sessions: {this.state.inperson ? "Yes" : "No"}</p>
                                    <p>Address: {this.state.address}</p>
                            </div>
                        </div>
                        <div className="col m1 hide-on-small-only"></div>
                    </div>
                </section>
            </div>
        )
    }
}
export default Profile;