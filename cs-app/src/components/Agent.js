import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../style/agent.css';
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

const MyComponent = () => {
  const { username, id } = useParams();
  const [customerNameQuery, setCustomerNameQuery] = useState('');
  const [queryTextQuery, setQueryTextQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cannedMessage, setCannedMessage] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [querySelected, setQuerySelected] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [selectedQueryCheck, setSelectedQueryCheck] = useState(null);
  const [selectedQueryMessages, setSelectedQueryMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isCloseConfirmationOpen, setIsCloseConfirmationOpen] = useState(false);
  useEffect(()=>{
  
    if(selectedQuery){
      socket.emit("setup",selectedQuery);
    }

  },[querySelected]);
  useEffect(()=>{
    socket.on('dataUpdate', (updatedData) => {
      performSearch();
       });
    socket.on('message recieved',(newMessage)=>{
      if(selectedQuery){
        handleQueryClick(selectedQuery);
      }
    });
});

  const handleCannedMessageSelect = (selectedCannedMessage) => {
    setMessage(selectedCannedMessage);
  };
  
  //close a query
  const handleConfirmClose = () => {
    if (selectedQuery) {
      const { _id } = selectedQuery;
      axios
        .post(server_url+'/updateQuery', {
          queryId: _id,
          agentName: username,
          status: 'closed',
        })
        .then((response) => {
          setIsCloseConfirmationOpen(false);
          performSearch();
          setSelectedQuery(null);
        })
        .catch((error) => {
          console.error('Error updating query:', error);
        });
    }
  };

  const handleCustomerNameQueryChange = (e) => {
    setCustomerNameQuery(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const handleQueryTextQueryChange = (e) => {
    setQueryTextQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
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
         socket.emit("newMessage",newMessage);
          }
        })
        .catch((messageError) => {
          console.error('Error adding message:', messageError);
        });
    }
  };

  useEffect(() => {
    getCannedMessage();
  }, [id]);
 
  //get canned message
  const getCannedMessage = () => {
    axios
      .get(server_url+`/cannedMessage`)
      .then((response) => {
        setCannedMessage(response.data);
      })
      .catch((error) => {
        console.error('Error performing search:', error);
      });
  };

  //Search for query
  const performSearch = () => {
    axios
      .get(server_url+`/search?customerName=${customerNameQuery}&queryText=${queryTextQuery}&status=${statusFilter}`)
      .then((response) => {
        setSearchResults(response.data);
      })
      .catch((error) => {
        console.error('Error performing search:', error);
      });
  };

  useEffect(() => {
    performSearch();
  }, [customerNameQuery, queryTextQuery, statusFilter]);

  //get the message for a query
  const handleQueryClick = (query) => {
    if (query.Status === 'created') {
      setSelectedQueryCheck(query);
      setIsDialogOpen(true);
    } else {
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
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedQuery(null);
  };

  const handleTakeIssue = () => {
    if (selectedQueryCheck) {
      const { _id } = selectedQueryCheck;
      axios
        .post(server_url+'/updateQuery', {
          queryId: _id,
          agentName: username,
          status: 'open',
        })
        .then((response) => {
          axios
            .post(server_url+'/addMessage', {
              queryId: _id,
            })
            .then((messageResponse) => {
              handleCloseDialog();
              performSearch();
            })
            .catch((messageError) => {
              console.error('Error adding message:', messageError);
            });
        })
        .catch((error) => {
          console.error('Error updating query:', error);
        });
    }
  };
  
  return (
    <div className="container">
      <header className="header">
        <Link to="/">{username}</Link>
      </header>
      <div className="content">
        <div className="left-panel" style={{ flex: 2, backgroundColor: '#f0f0f0', padding: '10px' }}>
    
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by Customer Name..."
              value={customerNameQuery}
              onChange={handleCustomerNameQueryChange}
            />
            <input
              type="text"
              placeholder="Search by Query Text..."
              value={queryTextQuery}
              onChange={handleQueryTextQueryChange}
            />
            <select value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="">All</option>
              <option value="created">Created</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="search-results">
            {searchResults.map((result) => (
              <div
                key={result._id}
                className="query-box"
                style={{
                  borderColor:
                    result.Status === 'closed'
                      ? '#FF7F7F'
                      : result.Status === 'open'
                      ? '#A8FFB5'
                      : '#FFFD9E',
                }}
                onClick={() => {
                  handleQueryClick(result);
                  setQuerySelected(!querySelected);
                }}
                
              >
                <div className="query-header">
                  <p><strong>Query:</strong> {result.query}</p>
                  <p><span className="timestamp-label">Created time:</span> {formatTimestamp(result.createtimestamp)}</p>
                  <p>
                    <span className="timestamp-label">Days Passed:</span>{' '}
                    {calculateDaysAndHoursPassed(result.Status, result.createtimestamp, result.closetimestamp).days} days{' '}
                    {calculateDaysAndHoursPassed(result.Status, result.createtimestamp, result.closetimestamp).hours} hours
                  </p>
                  {result.Status === 'closed' && <p><span className="timestamp-label">Closed time:</span> {formatTimestamp(result.closetimestamp)}</p>}
                  <p><span className="agent-label">Username:</span> {result.username}</p>
                  {result.agentname !== '' && <p><span className="agent-label">Agent:</span> {result.agentname}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
       {/* Right panel */}
<div className="right-panel">
  {selectedQuery && (
    <div>
      <div className="query-h">
        <h2 className="query-t">Query Text: {selectedQuery.query}</h2>
        {selectedQuery.Status !== "closed" && (
          <button className="close-bw" onClick={() => setIsCloseConfirmationOpen(!isCloseConfirmationOpen)}>Close</button>
        )}
      </div>

<div className='grid2-agent'>
      {/* Display messages if available */}
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

      <div className='grid4'>
<div className="canned-messages">
  {selectedQuery.Status !== 'closed' && (
    <div className="canned-messages-container">
      {cannedMessage.map((messageData, index) => (
        <div
          key={index}
          className="canned-message"
          onClick={() => handleCannedMessageSelect(messageData.message)}
        >
          {messageData.message}
        </div>
      ))}
    </div>
  )}
</div>

      {/* Input and Send button */}
      <div className='grid3-agent'>
      {selectedQuery.Status !== 'closed' && (
        <div className="input-container-agent" >
          <input
            type="text"
            placeholder="Enter your response..."
            value={message}
            onChange={handleMessageChange} 
          />
          <button className='button-send' onClick={handleSendMessage}>Send</button>
        </div>
      )}
      </div>
    </div>
</div>

  )}
</div>

{/* Confirmation Dialog */}
{isCloseConfirmationOpen && (
  <div className="confirmation-popup">
    <button className="confirmation-close-button" onClick={() => setIsCloseConfirmationOpen(false)}>
      X
    </button>
    <div className="confirmation-popup-content">
      <div className="confirmation-dialog-text">
        <span>Are you sure you want to close this query?</span>
      </div>
      <div className="confirmation-dialog-button">
        <button onClick={handleConfirmClose}>OK</button>
      </div>
    </div>
  </div>
)}

{/* Issue Taking Dialog */}
{isDialogOpen && (
  <div className="issue-popup">
    <button className="issue-close-button" onClick={handleCloseDialog}>
      X
    </button>
    <div className="issue-popup-content">
      <div className="issue-dialog-text">
        <span>Do you want to take this issue?</span>
      </div>
      <div className="issue-dialog-button">
        <button onClick={handleTakeIssue}>OK</button>
      </div>
    </div>
  </div>
)}
</div>
</div>
  );
};

export default MyComponent;
