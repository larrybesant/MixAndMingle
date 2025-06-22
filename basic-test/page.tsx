"use client"

export default function BasicTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <h1>Basic Test Page</h1>
      <p>If you can see this, the server is working!</p>
      
      <button 
        onClick={() => alert('Button works!')}
        style={{
          padding: '10px 20px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          margin: '10px'
        }}
      >
        Test Button
      </button>
      
      <form onSubmit={(e) => {
        e.preventDefault()
        alert('Form works!')
      }}>
        <input 
          type="text" 
          placeholder="Test input"
          style={{
            padding: '10px',
            margin: '10px',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #666',
            borderRadius: '5px'
          }}
        />
        <button 
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            margin: '10px'
          }}
        >
          Submit Form
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/simple-signup" style={{ color: 'cyan', marginRight: '20px' }}>Simple Signup</a>
        <a href="/signup" style={{ color: 'cyan' }}>Main Signup</a>
      </div>
    </div>
  )
}
