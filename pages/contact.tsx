import React, { Component } from "react";

export default class extends Component {
    componentDidMount() {
        // document.title = "Contact | Croissant";
    }
    render(): React.ReactNode {
        return (
            <div className="container">
                <h2>Contact Us</h2>
                <form action="/submit-contact" method="POST">
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" name="email" required/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="message">Message:</label>
                        <textarea id="message" name="message" rows={4} required></textarea>
                    </div>
                    <button type="submit">Send Message</button>
                </form>
    
                <div className="container" style={{ marginTop: 20, fontStyle: "italic" }}>
                    For the moment, contacting us is useless.
                    Later, you will be able to contact us through the web interface.
                </div>
            </div>
        );
    }
}
