import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadVisualization from './LoadVisualization';

const SeaFreightCalculator = () => {
  const [formData, setFormData] = useState({
    length: '',
    width: '',
    height: '',
    quantity: '1',
    isFragile: false
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://sea-freight-load-calculator-backend.onrender.com/api/calculate', formData);
      setResult(response.data);
      console.log('Calculation result:', response.data); // Debug log
    } catch (err) {
      setError('Error calculating freight. Please try again.');
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create cargo items array for visualization
  const getCargoItems = () => {
    if (!formData.length || !formData.width || !formData.height) {
      console.log('Missing dimensions'); // Debug log
      return [];
    }
    
    const items = [];
    const quantity = parseInt(formData.quantity) || 1;
    
    for (let i = 0; i < quantity; i++) {
      items.push({
        length: Number(formData.length),
        width: Number(formData.width),
        height: Number(formData.height),
        isFragile: formData.isFragile
      });
    }
    
    console.log('Generated cargo items:', items); // Debug log
    return items;
  };

  // Get container type from result
  const getContainerType = () => {
    if (!result) return '20ft';
    if (result.suggestedContainer.includes('20ft')) return '20ft';
    if (result.suggestedContainer.includes('40ft')) return '40ft';
    return '40HC';
  };

  // Debug effect
  useEffect(() => {
    console.log('Current form data:', formData);
    console.log('Current result:', result);
  }, [formData, result]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="text-center mb-0">Sea Freight Load Calculator</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Length (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="length"
                      value={formData.length}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Width (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="width"
                      value={formData.width}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isFragile"
                      checked={formData.isFragile}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">Fragile Cargo</label>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? 'Calculating...' : 'Calculate'}
                  </button>
                </div>
              </form>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-4">
                  <h3 className="text-center mb-3">Results</h3>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th>Total CBM</th>
                          <td>{result.cbm} m³</td>
                        </tr>
                        <tr>
                          <th>Suggested Container</th>
                          <td>{result.suggestedContainer}</td>
                        </tr>
                        <tr>
                          <th>Estimated Weight</th>
                          <td>{result.totalWeight} kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result && (
                <div className="mt-4">
                  <h3 className="text-center mb-3">3D Load Visualization</h3>
                  <div className="border rounded p-3">
                    <LoadVisualization
                      cargoItems={getCargoItems()}
                      containerType={getContainerType()}
                    />
                    <div className="mt-2 text-center">
                      <small className="text-muted">
                        Blue: Regular cargo | Red: Fragile cargo
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeaFreightCalculator; 