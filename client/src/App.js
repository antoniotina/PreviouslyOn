import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/authActions';
import IndexNavbar from './components/IndexNavbar';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import Home from './components/home/Home';
import Show from './components/shows/Show'



class App extends React.Component {

    async componentDidMount() {
        await store.dispatch(loadUser());
    }

    render() {
        return (
            <Provider store={store}>
                <Router>
                    <IndexNavbar />
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/show/:showid" component={Show} />
                    </Switch>
                </Router>
            </Provider>
        )
    }
}

export default App;