import axios from 'axios'
import React, {useState} from 'react'
import {Container, Button, Form, Spinner} from 'react-bootstrap'
import './App.css'

function App() {
  const [inputMode, setInputMode] = useState('id');
  const [id, setID] = useState('');
  const [manualInput, setManualInput] = useState({
    absoluteMagnitude: 0,
    estimatedDiameterMin: 0,
    estimatedDiameterMax: 0,
    orbitingBody: 'Earth',
    relativeVelocity: 0,
    missDistance: 0
  });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    output: undefined,
    falsePredict: undefined,
    truePredict: undefined,
    startDate: '',
    endDate: ''
  });

  const handleInputChange = (e) => {
    if (inputMode === 'id') {
      setID(e.target.value);
    } else {
      setManualInput((prevInput) => ({ ...prevInput, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (inputMode === 'id') {
      if (!id) {
        alert('Please enter a valid Asteroid ID');
        setLoading(false);
        return;
      }
      axios.post('https://neo-api-wm2r.onrender.com/predict', { 
        ID: id,
        dataManual: null})
        .then((res) => {
          if (res.data === 'CUH'){
            alert('This deployment cannot be processed because it exceeds the allocated capacity unit hours (CUH) in IBM Watson Studio. Please try again later.');
            setID('');
            return
          }
          else if (res.data === 'invalid'){
            alert('Invalid Input Data');
            setID('');
            return
          }
          else{
          console.log(res.data);
          setData(res.data);
          }
        })
        .finally(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          alert("An error occurred while processing your request. Invalid asteroid ID. Please provide a correct ID.");
          setLoading(false);
          setID('');
          return
        });
    } else {
      if (
        !manualInput.absoluteMagnitude || manualInput.absoluteMagnitude === 0 ||
        !manualInput.estimatedDiameterMin || manualInput.estimatedDiameterMin === 0 ||
        !manualInput.estimatedDiameterMax || manualInput.estimatedDiameterMax === 0 ||
        !manualInput.relativeVelocity || manualInput.relativeVelocity === 0 ||
        !manualInput.missDistance || manualInput.missDistance === 0 
      ) {
        alert('Please fill in all manual input fields');
        setLoading(false);
        return;
      }
      const manualInputArray = [
        parseFloat(manualInput.absoluteMagnitude),
        parseFloat(manualInput.estimatedDiameterMin),
        parseFloat(manualInput.estimatedDiameterMax),
        manualInput.orbitingBody,
        parseFloat(manualInput.relativeVelocity),
        parseFloat(manualInput.missDistance)
      ]
      axios.post('https://neo-api-wm2r.onrender.com/predict', {
        ID: null,
        dataManual: manualInputArray})
        .then((res) => {
          if (res.data === 'CUH'){
            alert('This deployment cannot be processed because it exceeds the allocated capacity unit hours (CUH) in IBM Watson Studio. Please try again later.');
            return
          }
          else if (res.data === 'invalid'){
            alert('Invalid Input Data');
            return
          }
          else{
          console.log(res.data);
          setData(res.data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };


  return (
    <Container fluid className='galaxy-background text-white d-flex flex-column justify-content-center align-items-center'>
      <div>
        <h1 className='text-center text-white m-5'>NEO Hazardous Prediction Model</h1>
      </div>
      <Form>
        <Form.Group className="mb-3" controlId="inputMode">
          <Form.Label>Input Mode:</Form.Label>
          <Form.Check
            type="radio"
            label="Enter Asteroid ID"
            name="inputMode"
            value="id"
            checked={inputMode === 'id'}
            onChange={(e) => setInputMode(e.target.value)}
          />
          <Form.Check
            type="radio"
            label="Enter Values Manually"
            name="inputMode"
            value="manual"
            checked={inputMode === 'manual'}
            onChange={(e) => setInputMode(e.target.value)}
          />
        </Form.Group>
        {inputMode === 'id' ? (
          <div>
          <div className='manualMode'>
            From the Asteroid ID provided, Absoulte Magnitude, Diameter, Velocity, and Miss Distance are collected from NASA's Open API to feed into the Machine Learning model for prediction
          </div>
          <Form.Group className="mb-3" controlId="asteroidID">
            <Form.Label>Enter Asteroid ID</Form.Label>
            <Form.Control type="text" placeholder="3542519" value={id} onChange={handleInputChange} width={30}/>
          </Form.Group>
          </div>
          
        ) : (
          <div>
            <Form.Group className="mb-3" controlId="absoluteMagnitude">
              <Form.Label>Absolute Magnitude:</Form.Label>
              <Form.Control type="number" value={manualInput.absoluteMagnitude} onChange={handleInputChange} name="absoluteMagnitude" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="estimatedDiameterMin">
              <Form.Label>Estimated Diameter Min (In kilometers):</Form.Label>
              <Form.Control type="number" value={manualInput.estimatedDiameterMin} onChange={handleInputChange} name="estimatedDiameterMin" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="estimatedDiameterMax">
              <Form.Label>Estimated Diameter Max (In kilometers):</Form.Label>
              <Form.Control type="number" value={manualInput.estimatedDiameterMax} onChange={handleInputChange} name="estimatedDiameterMax" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="relativeVelocity">
              <Form.Label>Relative Velocity (In KMPH):</Form.Label>
              <Form.Control type="number" value={manualInput.relativeVelocity} onChange={handleInputChange} name="relativeVelocity" />
            </Form.Group>
            <Form.Group className="mb-3" controlId="missDistance">
              <Form.Label>Miss Distance (In kilometers):</Form.Label>
              <Form.Control type="number" value={manualInput.missDistance} onChange={handleInputChange} name="missDistance" />
            </Form.Group>
            </div>
        )}
        <Button variant="primary" type="submit" onClick={handleSubmit}>Submit</Button>
      </Form>
      {loading ? (
            <div className="loading-overlay d-flex align-items-center justify-content-center">
            <Spinner animation="border" variant="light" />
          </div>
          ) : (
            <div>
              {data.output!==undefined && (
                <div>
                  <h2>Results:</h2>
                  <p>Output: {data.output ? 'Hazardous' : 'Not Hazardous'}</p>
                  <p>Non-Hazardous Prediction: {data.falsePredict*100}%</p>
                  <p>Hazardous Prediction: {data.truePredict*100}%</p>
                  {inputMode==='id' && (<p>First Observation Date: {data.startDate}</p>)}
                  {inputMode==='id' && (<p>Last Observation Date: {data.endDate}</p>)}
                </div>
              )}
            </div>
          )}
      
    </Container>
  );
}

export default App;