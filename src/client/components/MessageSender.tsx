import React, { useState, useEffect } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';

interface InputForm {
  message: string;
  lastSendDate?: Date;
}

const MsgSender = () => {
  const [form, setForm] = useState<InputForm>({
    message: '',
  });
  const [disabledState, setDisabledState] = useState<boolean>(false);
  const updateMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, message: e.target.value });
  };
  const sendMessage = (e: React.MouseEvent<HTMLInputElement>) => {
    (async () => {
      if (form.message) {
        setDisabledState(true);
        setTimeout(() => {
          setDisabledState(false);
        }, 5000);
        await fetch('send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: form.message,
          }),
        });
        setForm({ ...form, lastSendDate: new Date(), message: '' });
      }
    })();
  };
  return (
    <>
      <div className="p-3">
        <div className="card">
          <div className="card-header">Send Message</div>
          <div className="card-body">
            <div className="mb-3">
              <div className="input-group mb-3">
                <input
                  type="text"
                  placeholder="Message"
                  className="form-control"
                  value={form.message}
                  onChange={updateMessage}
                  disabled={disabledState}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={disabledState}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MsgSender;
