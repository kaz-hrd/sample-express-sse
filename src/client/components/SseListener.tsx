import React, { useState, useEffect } from 'react';
import { NotificationMsg } from '../../common/common';

import 'bootstrap/dist/css/bootstrap.min.css';

type MessageHistory = { index: number; received: Date; message: string };
type ClientInfo = { begin: string; id: string };

const SseListener = () => {
  let messageCount = 1;
  const [lastMessage, setLastMessage] = useState<string>();
  const [messageList, setMessageList] = useState<MessageHistory[]>([]);
  const [lastPingTime, setLastPingTime] = useState<Date>();
  const [clientList, setClientList] = useState<ClientInfo[]>(
    new Array<ClientInfo>()
  );
  const [audioStatus, setAudioStatus] = useState<string>();

  const addMessage = (message: string) => {
    const date = new Date();
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

  useEffect(() => {
    const music = new Audio('alert.mp3');
    const evtSource: EventSource = new EventSource('sse', {
      withCredentials: true,
    });
    evtSource.onmessage = (e: MessageEvent) => {
      console.log(e.data);
      const data = JSON.parse(e.data) as NotificationMsg;
      switch (data.mode) {
        case 'ping':
          setLastPingTime(new Date());
          break;
        case 'notify':
          music
            .play()
            .then(() => {
              setAudioStatus('done.');
            })
            .catch((e) => {
              setAudioStatus('error.');
            });
          if (data.message) {
            addMessage(data.message);
            setLastMessage(data.message);
            setTimeout(() => {
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
  return (
    <>
      <div className="p-3">
        <div className="card">
          <div className="card-header">List of Messages.</div>
          <div className="card-body">
            <div>
              {lastMessage && (
                <div className="alert alert-danger" role="alert">
                  {lastMessage}
                </div>
              )}
            </div>
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">seq</th>
                  <th scope="col">received</th>
                  <th scope="col">message</th>
                </tr>
              </thead>
              <tbody>
                {messageList.map((item: MessageHistory) => {
                  return (
                    <tr key={item.index}>
                      <td>{item.index}</td>
                      <td>{item.received.toISOString()}</td>
                      <td>{item.message}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="card">
          <div className="card-header">List of Clients.</div>
          <div className="card-body">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th scope="col">id</th>
                  <th scope="col">begin</th>
                </tr>
              </thead>
              <tbody>
                {clientList.map((item: ClientInfo) => {
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.begin ? item.begin : 'Unkown'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="card">
          <div className="card-header">Other.</div>
          <div className="card-body">
            <table className="table table-striped table-hover">
              <tbody>
                <tr>
                  <td>Last message received</td>
                  <td>
                    {messageList &&
                      messageList.length > 0 &&
                      messageList[
                        messageList.length - 1
                      ].received.toISOString()}
                  </td>
                </tr>
                <tr>
                  <td>Last ping received</td>
                  <td>{lastPingTime && lastPingTime.toISOString()}</td>
                </tr>
                <tr>
                  <td>Status of audio</td>
                  <td>{audioStatus}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SseListener;
