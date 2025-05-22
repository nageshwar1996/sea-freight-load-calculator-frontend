import React, { useState } from "react";
import SeaFreightCalculator from "./components/SeaFreightCalculator";
import ContainerVisualization from "./components/ContainerVisualization";
import "bootstrap/dist/css/bootstrap.min.css";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [activeSection, setActiveSection] = useState('products');
  const [selectedTruck, setSelectedTruck] = useState('');
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Bag",
      length: 1000,
      width: 1000,
      height: 1000,
      weight: 30,
      quantity: 1,
      type: "Sacks" // Added type field
    }
  ]);

  const truckSpecs = {
    length: 13600,
    width: 2500,
    height: 2650,
    maxWeight: 24500
  };

  const calculateResults = () => {
    let totalPackages = 0;
    let totalVolume = 0;
    let totalWeight = 0;
    
    // Create product type distribution for pie chart
    const productTypes = {};

    products.forEach(product => {
      const quantity = parseInt(product.quantity) || 0;
      totalPackages += quantity;
      
      // Calculate volume in cubic millimeters
      const volume = (parseInt(product.length) || 0) * 
                    (parseInt(product.width) || 0) * 
                    (parseInt(product.height) || 0) * quantity;
      totalVolume += volume;
      
      // Calculate weight
      const weight = (parseInt(product.weight) || 0) * quantity;
      totalWeight += weight;
      
      // Group by product type
      const type = product.type || "Unspecified";
      if (!productTypes[type]) {
        productTypes[type] = {
          packages: 0,
          volume: 0,
          weight: 0
        };
      }
      
      productTypes[type].packages += quantity;
      productTypes[type].volume += volume / (1000 * 1000 * 1000); // Convert to cubic meters
      productTypes[type].weight += weight;
    });

    // Convert volume to cubic meters
    const volumeInCubicMeters = totalVolume / (1000 * 1000 * 1000);
    
    // Calculate truck's max volume in cubic meters
    const truckMaxVolume = (truckSpecs.length * truckSpecs.width * truckSpecs.height) / (1000 * 1000 * 1000);
    
    // Calculate utilization percentages
    const volumeUtilizationPercentage = (volumeInCubicMeters / truckMaxVolume * 100).toFixed(1);
    const weightUtilizationPercentage = (totalWeight / truckSpecs.maxWeight * 100).toFixed(1);

    return {
      totalPackages,
      totalVolume: volumeInCubicMeters.toFixed(2),
      totalWeight,
      productTypes,
      volumeUtilizationPercentage,
      weightUtilizationPercentage,
      truckMaxVolume: truckMaxVolume.toFixed(2)
    };
  };

  const handleProductChange = (id, field, value) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const addProduct = () => {
    const newId = products.length + 1;
    setProducts([
      ...products,
      {
        id: newId,
        name: "",
        length: "",
        width: "",
        height: "",
        weight: "",
        quantity: "1",
        type: "" // Added type field
      }
    ]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleNext = () => {
    setActiveSection('trucks');
  };

  const handleBack = () => {
    setActiveSection('products');
  };

  const results = calculateResults();
  
  // Prepare data for pie charts
  const prepareChartData = (dataKey) => {
    const labels = Object.keys(results.productTypes);
    const data = labels.map(type => results.productTypes[type][dataKey]);
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="App">
      {/* <SeaFreightCalculator /> */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded shadow-sm">
          <div className={`d-flex align-items-center ${activeSection === 'products' ? 'text-primary' : ''}`}>
            <span className={`badge ${activeSection === 'products' ? 'bg-primary' : 'bg-secondary'} me-2`}>1</span>
            <h5 className="mb-0">Products</h5>
          </div>
          <div className={`d-flex align-items-center ${activeSection === 'trucks' ? 'text-primary' : ''}`}>
            <span className={`badge ${activeSection === 'trucks' ? 'bg-primary' : 'bg-secondary'} me-2`}>2</span>
            <h5 className="mb-0">Trucks</h5>
          </div>
          <div className={`d-flex align-items-center ${activeSection === 'results' ? 'text-primary' : ''}`}>
            <span className={`badge ${activeSection === 'results' ? 'bg-primary' : 'bg-secondary'} me-2`}>3</span>
            <h5 className="mb-0">Results</h5>
          </div>
        </div>

        {activeSection === 'products' && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Product Details</h4>
              <button 
                className="btn btn-primary"
                onClick={addProduct}
              >
                Add Product
              </button>
            </div>

            {products.map((product) => (
              <div key={product.id} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Product {product.id}</h5>
                    {products.length > 1 && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => removeProduct(product.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={product.name}
                        onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Type</label>
                      <select
                        className="form-select"
                        value={product.type || ""}
                        onChange={(e) => handleProductChange(product.id, 'type', e.target.value)}
                      >
                        <option value="">Select Type</option>
                        <option value="Sacks">Sacks</option>
                        <option value="Boxes">Boxes</option>
                        <option value="Pallets">Pallets</option>
                        <option value="Drums">Drums</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Length (mm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.length}
                        onChange={(e) => handleProductChange(product.id, 'length', e.target.value)}
                        placeholder="Enter length"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Width (mm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.width}
                        onChange={(e) => handleProductChange(product.id, 'width', e.target.value)}
                        placeholder="Enter width"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Height (mm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.height}
                        onChange={(e) => handleProductChange(product.id, 'height', e.target.value)}
                        placeholder="Enter height"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.weight}
                        onChange={(e) => handleProductChange(product.id, 'weight', e.target.value)}
                        placeholder="Enter weight"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.quantity}
                        onChange={(e) => handleProductChange(product.id, 'quantity', e.target.value)}
                        min="1"
                        placeholder="Enter quantity"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-end mt-3">
              <button 
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {activeSection === 'trucks' && (
          <div className="mt-4">
            <h4>Truck Selection</h4>
            <div className="card">
              <div className="card-body">
                <select 
                  className="form-select mb-4"
                  value={selectedTruck}
                  onChange={(e) => setSelectedTruck(e.target.value)}
                >
                  <option value="">Select Truck</option>
                  <option value="tautliner">Tautliner (Curainsider) truck</option>
                </select>

                {selectedTruck && (
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Truck Specifications</h5>
                      <div className="row">
                        <div className="col-md-3 mb-2">
                          <div className="d-flex flex-column">
                            <small className="text-muted">Length</small>
                            <strong>{truckSpecs.length.toLocaleString()} mm</strong>
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div className="d-flex flex-column">
                            <small className="text-muted">Width</small>
                            <strong>{truckSpecs.width.toLocaleString()} mm</strong>
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div className="d-flex flex-column">
                            <small className="text-muted">Height</small>
                            <strong>{truckSpecs.height.toLocaleString()} mm</strong>
                          </div>
                        </div>
                        <div className="col-md-3 mb-2">
                          <div className="d-flex flex-column">
                            <small className="text-muted">Max Weight</small>
                            <strong>{truckSpecs.maxWeight.toLocaleString()} kg</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between">
                  <button 
                    className="btn btn-secondary"
                    onClick={handleBack}
                  >
                    Back
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveSection('results')}
                    disabled={!selectedTruck}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'results' && (
          <div className="mt-4">
            <h4>Calculation Results</h4>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="card bg-light mb-3">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Total</h6>
                        <h3 className="mb-0">{results.totalPackages}</h3>
                        <small className="text-muted">Total Packages</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light mb-3">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Cargo Volume</h6>
                        <h3 className="mb-0">{results.totalVolume}</h3>
                        <small className="text-muted">Cubic Meters(m³)</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light mb-3">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Cargo weight</h6>
                        <h3 className="mb-0">{results.totalWeight.toLocaleString()}</h3>
                        <small className="text-muted">kilograms</small>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Capacity Utilization Indicators */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6 className="text-center mb-3">Volume Utilization</h6>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Used: {results.totalVolume} m³</span>
                          <span>Max: {results.truckMaxVolume} m³</span>
                        </div>
                        <div className="progress mb-2" style={{ height: '25px' }}>
                          <div 
                            className={`progress-bar ${parseFloat(results.volumeUtilizationPercentage) > 100 ? 'bg-danger' : 'bg-success'}`} 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, results.volumeUtilizationPercentage)}%` }}
                            aria-valuenow={results.volumeUtilizationPercentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          >
                            {results.volumeUtilizationPercentage}%
                          </div>
                        </div>
                        {parseFloat(results.volumeUtilizationPercentage) > 100 && (
                          <div className="text-danger small">
                            Warning: Volume exceeds truck capacity by {(parseFloat(results.volumeUtilizationPercentage) - 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="card-body">
                        <h6 className="text-center mb-3">Weight Utilization</h6>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Used: {results.totalWeight.toLocaleString()} kg</span>
                          <span>Max: {truckSpecs.maxWeight.toLocaleString()} kg</span>
                        </div>
                        <div className="progress mb-2" style={{ height: '25px' }}>
                          <div 
                            className={`progress-bar ${parseFloat(results.weightUtilizationPercentage) > 100 ? 'bg-danger' : 'bg-success'}`} 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, results.weightUtilizationPercentage)}%` }}
                            aria-valuenow={results.weightUtilizationPercentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          >
                            {results.weightUtilizationPercentage}%
                          </div>
                        </div>
                        {parseFloat(results.weightUtilizationPercentage) > 100 && (
                          <div className="text-danger small">
                            Warning: Weight exceeds truck capacity by {(parseFloat(results.weightUtilizationPercentage) - 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Distribution Section */}
                <div className="mt-4">
                  <h5 className="mb-3">Product Distribution</h5>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="text-center mb-3">Packages Distribution</h6>
                          <div style={{ height: '250px' }}>
                            {Object.keys(results.productTypes).length > 0 ? (
                              <Pie data={prepareChartData('packages')} options={pieOptions} />
                            ) : (
                              <p className="text-center text-muted">No product type data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="text-center mb-3">Volume Distribution</h6>
                          <div style={{ height: '250px' }}>
                            {Object.keys(results.productTypes).length > 0 ? (
                              <Pie data={prepareChartData('volume')} options={pieOptions} />
                            ) : (
                              <p className="text-center text-muted">No product type data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="text-center mb-3">Weight Distribution</h6>
                          <div style={{ height: '250px' }}>
                            {Object.keys(results.productTypes).length > 0 ? (
                              <Pie data={prepareChartData('weight')} options={pieOptions} />
                            ) : (
                              <p className="text-center text-muted">No product type data available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* List View of Product Distribution */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Product Distribution Details</h6>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Product Type</th>
                              <th>Packages</th>
                              <th>Volume (m³)</th>
                              <th>Weight (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(results.productTypes).map((type, index) => (
                              <tr key={index}>
                                <td>{type}</td>
                                <td>{results.productTypes[type].packages}</td>
                                <td>{results.productTypes[type].volume.toFixed(2)}</td>
                                <td>{results.productTypes[type].weight.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="mb-3">3D Visualization</h5>
                  <ContainerVisualization 
                    products={products}
                    truckSpecs={truckSpecs}
                  />
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setActiveSection('trucks')}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
