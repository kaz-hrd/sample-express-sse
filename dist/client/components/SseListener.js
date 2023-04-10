import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
var SseListener = function () {
    var messageCount = 1;
    var _a = useState(), lastMessage = _a[0], setLastMessage = _a[1];
    var _b = useState([]), messageList = _b[0], setMessageList = _b[1];
    var _c = useState(), lastPingTime = _c[0], setLastPingTime = _c[1];
    var _d = useState(new Array()), clientList = _d[0], setClientList = _d[1];
    var _e = useState(), audioStatus = _e[0], setAudioStatus = _e[1];
    var addMessage = function (message) {
        var date = new Date();
        messageList.push({
            index: messageCount++,
            message: message,
            received: date,
        });
        if (messageList.length == 6) {
            messageList.shift();
        }
        setMessageList(messageList);
    };
    useEffect(function () {
        var music = new Audio('alert.mp3');
        var evtSource = new EventSource('sse', {
            withCredentials: true,
        });
        evtSource.onmessage = function (e) {
            console.log(e.data);
            var data = JSON.parse(e.data);
            switch (data.mode) {
                case 'ping':
                    setLastPingTime(new Date());
                    break;
                case 'notify':
                    music
                        .play()
                        .then(function () {
                        setAudioStatus('done.');
                    })
                        .catch(function (e) {
                        setAudioStatus('error.');
                    });
                    if (data.message) {
                        addMessage(data.message);
                        setLastMessage(data.message);
                        setTimeout(function () {
                            setLastMessage('');
                        }, 5000);
                    }
                    break;
                case 'clientList':
                    if (data.data) {
                        setClientList(JSON.parse(data.data));
                    }
                    break;
            }
        };
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "p-3" },
            React.createElement("div", { className: "card" },
                React.createElement("div", { className: "card-header" }, "List of Messages."),
                React.createElement("div", { className: "card-body" },
                    React.createElement("div", null, lastMessage && (React.createElement("div", { className: "alert alert-danger", role: "alert" }, lastMessage))),
                    React.createElement("table", { className: "table table-striped table-hover" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", { scope: "col" }, "seq"),
                                React.createElement("th", { scope: "col" }, "received"),
                                React.createElement("th", { scope: "col" }, "message"))),
                        React.createElement("tbody", null, messageList.map(function (item) {
                            return (React.createElement("tr", { key: item.index },
                                React.createElement("td", null, item.index),
                                React.createElement("td", null, item.received.toISOString()),
                                React.createElement("td", null, item.message)));
                        })))))),
        React.createElement("div", { className: "p-3" },
            React.createElement("div", { className: "card" },
                React.createElement("div", { className: "card-header" }, "List of Clients."),
                React.createElement("div", { className: "card-body" },
                    React.createElement("table", { className: "table table-striped table-hover" },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", { scope: "col" }, "id"),
                                React.createElement("th", { scope: "col" }, "begin"))),
                        React.createElement("tbody", null, clientList.map(function (item) {
                            return (React.createElement("tr", { key: item.id },
                                React.createElement("td", null, item.id),
                                React.createElement("td", null, item.begin ? item.begin : 'Unkown')));
                        })))))),
        React.createElement("div", { className: "p-3" },
            React.createElement("div", { className: "card" },
                React.createElement("div", { className: "card-header" }, "Other."),
                React.createElement("div", { className: "card-body" },
                    React.createElement("table", { className: "table table-striped table-hover" },
                        React.createElement("tbody", null,
                            React.createElement("tr", null,
                                React.createElement("td", null, "Last message received"),
                                React.createElement("td", null, messageList &&
                                    messageList.length > 0 &&
                                    messageList[messageList.length - 1].received.toISOString())),
                            React.createElement("tr", null,
                                React.createElement("td", null, "Last ping received"),
                                React.createElement("td", null, lastPingTime && lastPingTime.toISOString())),
                            React.createElement("tr", null,
                                React.createElement("td", null, "Status of audio"),
                                React.createElement("td", null, audioStatus)))))))));
};
export default SseListener;
//# sourceMappingURL=SseListener.js.map