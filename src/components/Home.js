import React, { useState, useEffect } from 'react';


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

function Home() {
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [gptResponse, setGptResponse] = useState('');


  useEffect(() => {
    handleListen();
  }, [isListening]);

  const handleButtonClick = () => {
    processMessageToChatGPT("This is an idea I have: " + note + ". Summarize the key points of this app (only write the points, no intro to the points)", 1000).then((response) => {
        setGptResponse(response);
        });
  };

  async function processMessageToChatGPT(message, max_tokens){
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + process.env.REACT_APP_PRIVATE_KEY
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{role:'system', content:message}],
        max_tokens: max_tokens,
        n: 1,
        
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }


  const handleInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleListen = () => {
    if(isListening) {
        mic.start();
        mic.onend = () => {
            console.log('continue..');
            mic.start();
        }
    } else {
        mic.stop();
        mic.onend = () => {
            console.log("stopped mic onclick")
        }
    }
    mic.onstart = () => {
        console.log('Mics on');
    }

    mic.onresult = event => {
        const transcript = Array.from(event.results).map(result => result[0]).map(result => result.transcript).join('')
        console.log(transcript);
        setNote(transcript);
        mic.onerror = event => {
            console.log(event.error);
        }
    }
  }

  return (
    <div>
      <h1>NeuralNotes</h1>
      <h2>Neural Notes takes your ideas and stores them in a way that is actually useful</h2>
      {/* <input type="text" value={userInput} onChange={handleInputChange} /> */}
      {isListening ? <span>🎙️</span> : <span>🛑🎙️</span> }

      <button onClick={() => setIsListening(prevState => !prevState)}>Start/Stop</button>
      <h2>Current Note</h2>
      <br></br>
      <p>{note}</p>
      <button onClick={handleButtonClick}>Submit</button>
      <br/>
      <br/>
      <textarea value={gptResponse} readOnly />
    </div>
  );
}

export default Home;