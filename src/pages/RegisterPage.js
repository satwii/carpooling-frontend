import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, uploadDriverLicense } from '../services/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', password: '', role_id: 2, // Default to Rider
        license_no: '', issue_date: '', expiry_date: '',
        emergency_name: '', emergency_phone: ''
    });

    const [licenseFile, setLicenseFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'role_id' ? parseInt(value) : value }));
    };

    const handleFileChange = (e) => {
        setLicenseFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const isDriver = formData.role_id === 1;

        // Validation for Driver: Ensure file is attached
        if (isDriver && !licenseFile) {
            setError('Please upload your license document to register as a driver.');
            setLoading(false);
            return;
        }

        try {
            // Step 1: Register the user (sends all data except the file)
            await registerUser(formData);

            // Step 2: Log in the user immediately to get a secure token
            const loginRes = await loginUser({ email: formData.email, password: formData.password });
            const token = loginRes.token;

            // Step 3: If Driver, upload the license file using the token
            if (isDriver && licenseFile && token) {
                await uploadDriverLicense(licenseFile, token);
            }

            // Using custom message instead of alert()
            alert('Registration successful! Please proceed to login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed. Please check if the email is already registered.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isDriver = formData.role_id === 1;

    return (
        <div style={styles.pageContainer}>
            <div style={styles.formCard}>
                <h2 style={styles.title}>Create Your Account</h2>
                <p style={styles.subtitle}>Join our community and start your journey!</p>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Common Fields */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input style={styles.input} type="text" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone</label>
                        <input style={styles.input} type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input style={styles.input} type="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Register as</label>
                        <select style={styles.select} name="role_id" value={formData.role_id} onChange={handleChange}>
                            <option value={2}>Rider</option>
                            <option value={1}>Driver</option>
                        </select>
                    </div>

                    {/* Conditional Fields: Driver */}
                    {isDriver && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Driver Details</h3>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>License Number</label>
                                <input style={styles.input} type="text" name="license_no" value={formData.license_no} onChange={handleChange} required />
                            </div>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Issue Date</label>
                                    <input style={styles.input} type="date" name="issue_date" value={formData.issue_date} onChange={handleChange} required />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Expiry Date</label>
                                    <input style={styles.input} type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />
                                </div>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Upload License Document (PDF/Image)</label>
                                <input style={styles.fileInput} type="file" onChange={handleFileChange} required={isDriver} />
                            </div>
                        </div>
                    )}

                    {/* Conditional Fields: Rider */}
                    {!isDriver && (
                        <div style={styles.section}>
                            <h3 style={styles.sectionTitle}>Emergency Contact</h3>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Contact Name</label>
                                <input style={styles.input} type="text" name="emergency_name" value={formData.emergency_name} onChange={handleChange} required />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Contact Phone</label>
                                <input style={styles.input} type="tel" name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} required />
                            </div>
                        </div>
                    )}

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Processing...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Styles (Simplified and merged from previous examples for better visibility)
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Inter, Arial, sans-serif',
        padding: '20px',
    },
    formCard: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '550px',
        boxSizing: 'border-box',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#1a202c',
        textAlign: 'center',
        margin: '0 0 8px 0',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#718096',
        textAlign: 'center',
        margin: '0 0 30px 0',
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
        color: '#c53030',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        border: '1px solid #c53030',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '0.9rem',
        color: '#4a5568',
        marginBottom: '6px',
        fontWeight: '600',
    },
    input: {
        padding: '12px',
        fontSize: '1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxSizing: 'border-box',
        width: '100%',
        transition: 'border-color 0.3s',
    },
    select: {
        padding: '12px',
        fontSize: '1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxSizing: 'border-box',
        width: '100%',
        backgroundColor: '#fff',
    },
    fileInput: {
        padding: '5px',
        fontSize: '1rem',
    },
    button: {
        padding: '14px',
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#fff',
        backgroundColor: '#38a169',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '10px',
    },
    row: {
        display: 'flex',
        gap: '15px',
    },
    section: {
        borderTop: '1px solid #e2e8f0',
        paddingTop: '20px',
        marginTop: '20px',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        color: '#2d3748',
        marginBottom: '15px',
        fontWeight: '600',
    }
};

export default RegisterPage;
