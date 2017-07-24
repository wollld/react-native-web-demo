```
//第三方库
import React,{Component} from "react";
import {AppRegistry, View, Platform,Text,TouchableOpacity}from "react-native";
import createHistory from 'history/createHashHistory';
import {createStore,applyMiddleware} from "redux";
import {composeWithDevTools} from "redux-devtools-extension/logOnlyInProduction";//调试
import reduxThunk from "redux-thunk";
import { Route } from 'react-router';
import reducers from "../../redux/reducer";
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import {Provider} from "react-redux";

//自定义
import TaskList from "./TaskList";
import Detail from  "./Detail";
import DoTask from "./DoTask";


//store
const composeEnhancers = composeWithDevTools({ realtime: true, port: 8000 });
const history= createHistory({
    hashType: 'noslash'//#hash
});
const historyMiddleware= routerMiddleware(history);
const store=createStore(
    reducers,
    composeEnhancers(applyMiddleware(historyMiddleware,reduxThunk))
);

class TaskAction extends Component{
    render(){
        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <View style={{flex:1}}>
                        <Route exact path="/" component={TaskList}/>
                        <Route  path="/Detail/:templateId" component={Detail}/>
                        <Route  path="/Preview" component={Preview}/>
                        <Route  path="/DoTask/:type/:id" component={DoTask}/>
                    </View>
                </ConnectedRouter>
            </Provider>
        );
    }
}


AppRegistry.registerComponent("TaskAction",()=>TaskAction);
//web插入组件
if (Platform.OS === "web") {
    AppRegistry.runApplication("TaskAction", {
        initialProps: {},
        rootTag: document.getElementById("react-root")
    });
}
export default TaskAction;
```
