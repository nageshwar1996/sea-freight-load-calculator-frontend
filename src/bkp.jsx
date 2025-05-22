import React, { useState } from "react";
import SeaFreightCalculator from "./components/SeaFreightCalculator";
import ContainerVisualization from "./components/ContainerVisualization";
import "bootstrap/dist/css/bootstrap.min.css";

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
      quantity: 1
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
    });

    // Convert volume to cubic meters
    const volumeInCubicMeters = totalVolume / (1000 * 1000 * 1000);

    return {
      totalPackages,
      totalVolume: volumeInCubicMeters.toFixed(2),
      totalWeight
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
        quantity: "1"
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
                      <label className="form-label">Length / Diameter (mm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.length}
                        onChange={(e) => handleProductChange(product.id, 'length', e.target.value)}
                        placeholder="Enter length"
                      />
                    </div>
                  </div>
                  <div className="row">
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
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={product.weight}
                        onChange={(e) => handleProductChange(product.id, 'weight', e.target.value)}
                        placeholder="Enter weight"
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
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
                        <h6 className="text-muted mb-2">Total Packages</h6>
                        <h3 className="mb-0">{results.totalPackages}</h3>
                        <small className="text-muted">bags</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light mb-3">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Total Volume</h6>
                        <h3 className="mb-0">{results.totalVolume}</h3>
                        <small className="text-muted">cubic meters(m³)</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card bg-light mb-3">
                      <div className="card-body text-center">
                        <h6 className="text-muted mb-2">Total Weight</h6>
                        <h3 className="mb-0">{results.totalWeight.toLocaleString()}</h3>
                        <small className="text-muted">kilograms</small>
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
