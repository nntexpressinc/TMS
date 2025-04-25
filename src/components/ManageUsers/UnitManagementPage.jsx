import React, { useState, useEffect } from 'react';
import { ApiService } from '../../api/auth';
import './UnitManagement.scss';

const UnitManagementPage = () => {
  const [units, setUnits] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [dispatchers, setDispatchers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsData, trucksData, trailersData, dispatchersData, driversData] = await Promise.all([
          ApiService.getData('/unit/'),
          ApiService.getData('/truck/'),
          ApiService.getData('/trailer/'),
          ApiService.getData('/dispatcher/'),
          ApiService.getData('/driver/')
        ]);

        setUnits(unitsData);
        setTrucks(trucksData);
        setTrailers(trailersData);
        setDispatchers(dispatchersData);
        setDrivers(driversData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="unit-management">
      <h1>Unit Management</h1>
      <div className="units-grid">
        {units.map((unit) => (
          <div key={unit.id} className="unit-card">
            <h2>Unit #{unit.unit_number}</h2>
            <div className="unit-details">
              <div className="section">
                <h3>Trucks</h3>
                <ul>
                  {unit.truck.map((truckId) => {
                    const truck = trucks.find(t => t.id === truckId);
                    return truck ? (
                      <li key={truckId}>
                        {truck.make} {truck.model} - {truck.plate_number}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
              <div className="section">
                <h3>Trailers</h3>
                <ul>
                  {unit.trailer.map((trailerId) => {
                    const trailer = trailers.find(t => t.id === trailerId);
                    return trailer ? (
                      <li key={trailerId}>
                        {trailer.make} {trailer.model} - {trailer.plate_number}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
              <div className="section">
                <h3>Drivers</h3>
                <ul>
                  {unit.driver.map((driverId) => {
                    const driver = drivers.find(d => d.id === driverId);
                    return driver ? (
                      <li key={driverId}>
                        {driver.first_name} {driver.last_name}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
              <div className="section">
                <h3>Dispatchers</h3>
                <ul>
                  {unit.dispatcher.map((dispatcherId) => {
                    const dispatcher = dispatchers.find(d => d.id === dispatcherId);
                    return dispatcher ? (
                      <li key={dispatcherId}>
                        {dispatcher.first_name} {dispatcher.last_name}
                      </li>
                    ) : null;
                  })}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitManagementPage; 