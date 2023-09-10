import React, { useState, useEffect,useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../style/Customer.css';
import axios from 'axios';
import io from 'socket.io-client';
const server_url =process.env.REACT_APP_SERVER_URL;
var socket = io(server_url);

//Function to format the time from UTC
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  return `${formattedDate} ${formattedTime}`;
}

//Function to display the number days passed for a query
const calculateDaysAndHoursPassed = (status, createtimestamp, closetimestamp) => {
  const currentDate = new Date();
  const createTime = new Date(createtimestamp);
  let timeDifference;
  if (status === 'closed') {
    const closeTime = new Date(closetimestamp);
    timeDifference = closeTime.getTime() - createTime.getTime();
  } else {
    timeDifference = currentDate.getTime() - createTime.getTime();
  }
  const daysPassed = Math.floor(timeDifference / (1000 * 3600 * 24));
  const hoursPassed = Math.floor((timeDifference % (1000 * 3600 * 24)) / (1000 * 3600));
  return {
    days: daysPassed,
    hours: hoursPassed,
  };
};

const Customer = () => {
  const { username, id } = useParams();
  const [showModalshow, setShowModalshow] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [querySelected, setQuerySelected] = useState(false);
  
  const [queries, setQueries] = useState([]);
  const [selectedQueryMessages, setSelectedQueryMessages] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(()=>{
    if(selectedQuery){
      socket.emit("setup",selectedQuery);
    }
  },[querySelected]);

  useEffect(()=>{
    socket.on('dataUpdate', (updatedData) => {
     fetchQueries();
       });
    socket.on('message recieved',(newMessage)=>{
      if(selectedQuery){
        handleQueryClick(selectedQuery);
      }
    });
});

  const toggleModalOnly = () => {
    setShowModalshow(!showModalshow);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  //send message
  const handleSendMessage = () => {
    if (selectedQuery) {
      const { _id } = selectedQuery;
      axios
        .post(server_url+'/messageSend', {
          queryId: _id,
          username: username,
          message: message,
        })
        .then((messageResponse) => {
          handleQueryClick(selectedQuery);
          setMessage('');
          const newMessage ={
            queryId: _id,
            username: username,
            message: message
          };
            if(newMessage){
         socket.emit("newMessage",newMessage);}
        })
        .catch((messageError) => {
          console.error('Error adding message:', messageError);
        });
    }
  };

//Fetch message
  const handleQueryClick = (query) => {
    if (query.Status !== 'created') {
      setSelectedQuery(query);
      axios
        .get(server_url+`/messages?queryId=${query._id}`)
        .then((response) => {
          const messages = response.data;
          setSelectedQueryMessages(messages);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
        });
    }
  };

  const toggleModal = () => {
    if (queryText === '') {
      alert('Please Enter Your Query');
    } else {
      setShowModalshow(!showModalshow);
      const currentTimeStamp = new Date().toISOString();
      axios
        .post(server_url+'/query', {
          username: username,
          query: queryText,
          createTimeStamp: currentTimeStamp,
          id: id,
        })
        .then((response) => {
          alert('Your Query is Submitted!');
          setQueryText('');
        })
        .catch((error) => {
          console.error('Error adding query:', error);
        });
    }
  };

  const handleQueryTextChange = (e) => {
    setQueryText(e.target.value);
  };

  //Fetch query
  const fetchQueries = () => {
    axios
      .get(server_url+`/querylist/${id}`)
      .then((response) => {
        setQueries(response.data);
      })
      .catch((error) => {
        console.error('Error fetching user queries:', error);
      });
  };

  useEffect(() => {
    fetchQueries();
  }, [id]);

  return (
    <div>
      <header className="header">
        <div className="left-corner">
          <Link to="/">{username}</Link>
        </div>
        <div className="right-corner">
          <button className="add-query-button" onClick={toggleModalOnly}>
            Add Query
          </button>
        </div>
      </header>

      <div className="body-container">
        <div className="left-panel">
          {/* Display each query in a box */}
          {queries.map((query) => (
             <div
            key={query._id}
            className="query-box"
            style={{
              borderColor:
                query.Status === 'closed'
                  ? '#FF7F7F'
                  : query.Status === 'open'
                  ? '#A8FFB5'
                  : '#FFFD9E',
            }}
            onClick={() => {
              handleQueryClick(query);
              setQuerySelected(!querySelected);
            }}
            
          >
            <div className="query-header">
              <p><strong>Query:</strong> {query.query}</p>
              <p><span className="timestamp-label">Created time:</span> {formatTimestamp(query.createtimestamp)}</p>
              <p><span className="timestamp-label">Status:</span>{query.Status}</p>
              <p>
                    <span className="timestamp-label">Days Passed:</span>{' '}
                    {calculateDaysAndHoursPassed(query.Status, query.createtimestamp, query.closetimestamp).days} days{' '}
                    {calculateDaysAndHoursPassed(query.Status, query.createtimestamp, query.closetimestamp).hours} hours
                  </p>
                  {query.Status === 'closed' && <p><span className="timestamp-label">Closed time:</span> {formatTimestamp(query.closetimestamp)}</p>}
              {query.agentname!=="" && <p><span className="agent-label">Agent:</span> {query.agentname}</p>}
            </div>
          </div>
          
          ))}
        </div>

        <div className="right-panel">
  {selectedQuery && (
    <div className='gridparent'>
    <div className='grid1'>
      <div className="query-h">
        <h2 className="query-t">Query Text: {selectedQuery.query}</h2>
      </div></div>

<div className='grid2'>
      {/* Message box for displaying messages */}
      {selectedQueryMessages && selectedQueryMessages.length > 0 && (
        <div className="message-box">
          {selectedQueryMessages.map((message, index) => (
            <div key={index} className={`message ${message.username === username ? 'sent' : 'received'}`}>
              <div className="username">{message.username}</div>
              <div className="message-text">{message.message}</div>
            </div>
          ))}
        </div>
      )}</div>
<div className='grid3'>
      {/* Input and Send button */}
      {selectedQuery.Status !== 'closed' && (
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter your response..."
            value={message}
            onChange={handleMessageChange}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}</div>
    </div>
  
  )}
</div>

      </div>
      {showModalshow && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-button" onClick={toggleModalOnly}>
              X
            </button>
            <h2>Please Type Your Query</h2>
            <form>
              <div className="text-box-container">
                <textarea
                  rows="4"
                  placeholder="Enter your query here..."
                  value={queryText}
                  onChange={handleQueryTextChange}
                ></textarea>
              </div>
              <button className="submit-button" onClick={toggleModal}>
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
