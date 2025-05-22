import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoadVisualization from './LoadVisualization';
import PDFExport from './PDFExport';

const SeaFreightCalculator = () => {
  const [items, setItems] = useState([
    {
      length: '',
      width: '',
      height: '',
      quantity: '1',
      isFragile: false
    }
  ]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPDF, setShowPDF] = useState(false);

  const handleItemChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [name]: type === 'checkbox' ? checked : value
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        length: '',
        width: '',
        height: '',
        quantity: '1',
        isFragile: false
      }
    ]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/calculate', { items });
      setResult(response.data);
      console.log('Calculation result:', response.data);
    } catch (err) {
      setError('Error calculating freight. Please try again.');
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create cargo items array for visualization
  const getCargoItems = () => {
    const allItems = [];
    const colors = ['#4444ff', '#44ff44', '#ff4444', '#ff44ff', '#44ffff', '#ffff44'];
    
    items.forEach((item, itemIndex) => {
      if (!item.length || !item.width || !item.height) return;
      
      const quantity = parseInt(item.quantity) || 1;
      const color = colors[itemIndex % colors.length];
      
      for (let i = 0; i < quantity; i++) {
        allItems.push({
          length: parseInt(item.length),
          width: parseInt(item.width),
          height: parseInt(item.height),
          isFragile: item.isFragile,
          color: color
        });
      }
    });
    
    return allItems;
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
    console.log('Current form data:', items);
    console.log('Current result:', result);
  }, [items, result]);

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
                {items.map((item, index) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="mb-0">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeItem(index)}
                        >
                          Remove Item
                        </button>
                      )}
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Length (cm)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="length"
                          value={item.length}
                          onChange={(e) => handleItemChange(index, e)}
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
                          value={item.width}
                          onChange={(e) => handleItemChange(index, e)}
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
                          value={item.height}
                          onChange={(e) => handleItemChange(index, e)}
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
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
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
                          checked={item.isFragile}
                          onChange={(e) => handleItemChange(index, e)}
                        />
                        <label className="form-check-label">Fragile Cargo</label>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between mb-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={addItem}
                  >
                    Add Another Item
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
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
                        Different colors represent different types of items
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">PDF Report</h3>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowPDF(!showPDF)}
                    >
                      {showPDF ? 'Hide PDF' : 'Show PDF'}
                    </button>
                  </div>
                  {showPDF && (
                    <div className="border rounded p-3">
                      <PDFExport
                        calculationData={result}
                        cargoItems={getCargoItems()}
                      />
                    </div>
                  )}
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