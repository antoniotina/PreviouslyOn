import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/authActions';
import IndexNavbar from './components/navbar/IndexNavbar';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import Home from './components/home/Home';
import Show from './components/shows/Show'
import Episode from './components/episodes/Episode'
import Friends from './components/friends/Friends'



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
                        <Route exact path="/episode/:episodeid" component={Episode} />
                        <Route exact path="/friends" component={Friends} />
                        <Route render={() => <Redirect to={{ pathname: "/" }} />} />
                    </Switch>
                </Router>
            </Provider>
        )
    }
}

export default App;