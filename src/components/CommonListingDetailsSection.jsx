import React from 'react'

const CommonListingDetailsSection = ({ values = {}, onChange }) => {
  const set = (key, value) => onChange && onChange(key, value)

  return (
    <div className="step-form" style={{ marginTop: '1rem' }}>
      <h3>Additional Listing Section</h3>

      <div className="form-group">
        <label>Description</label>
        <textarea
          placeholder="Enter description"
          value={values.description || ''}
          onChange={(e) => set('description', e.target.value)}
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Host a Property</label>
        <input
          type="text"
          placeholder="Enter host property details"
          value={values.hostAProperty || ''}
          onChange={(e) => set('hostAProperty', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Add Amenities</label>
        <textarea
          placeholder="Enter amenities"
          value={values.amenities || ''}
          onChange={(e) => set('amenities', e.target.value)}
          rows="2"
        />
      </div>

      <div className="form-group">
        <label>Features</label>
        <textarea
          placeholder="Enter features"
          value={values.features || ''}
          onChange={(e) => set('features', e.target.value)}
          rows="2"
        />
      </div>

      <div className="form-group">
        <label>Reservation</label>
        <input
          type="text"
          placeholder="Enter reservation details"
          value={values.reservation || ''}
          onChange={(e) => set('reservation', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Host Details</label>
        <textarea
          placeholder="Enter host details"
          value={values.hostDetails || ''}
          onChange={(e) => set('hostDetails', e.target.value)}
          rows="2"
        />
      </div>
    </div>
  )
}

export default CommonListingDetailsSection
