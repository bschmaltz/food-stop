import React, { Component } from 'react';
import './App.css';
import RouteForm from './RouteForm.js'

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2>Food Stop</h2>
                </div>
                <RouteForm />
            </div>

        );
    }
}

export default App;
