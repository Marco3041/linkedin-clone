import React, { useState, useEffect } from 'react';
import './Jobs.css';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

function Jobs() {
    const { currentUser } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);

    useEffect(() => {
        // Seed jobs if empty
        const seedJobs = async () => {
            const jobsSnapshot = await getDocs(collection(db, 'jobs'));
            if (jobsSnapshot.empty) {
                const initialJobs = [
                    { title: "Frontend Developer", company: "Google", location: "Mountain View, CA" },
                    { title: "React Engineer", company: "Meta", location: "Menlo Park, CA" },
                    { title: "Software Engineer II", company: "Amazon", location: "Seattle, WA" },
                    { title: "Full Stack Developer", company: "Netflix", location: "Los Gatos, CA" }
                ];
                initialJobs.forEach(async (job) => {
                    await addDoc(collection(db, 'jobs'), job);
                });
            }
        };
        seedJobs();

        // Listen to jobs
        const unsubscribeJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
            setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribeJobs();
    }, []);

    const applyToJob = async (jobId, company) => {
        if (!currentUser) return;
        try {
            await addDoc(collection(db, "applications"), {
                userId: currentUser.uid,
                jobId: jobId,
                timestamp: serverTimestamp()
            });

            await addDoc(collection(db, "notifications"), {
                userId: currentUser.uid,
                message: `You successfully applied for the position at ${company}`,
                timestamp: serverTimestamp()
            });

            setAppliedJobs(prev => [...prev, jobId]);
            alert(`Successfully applied to ${company}!`);
        } catch (error) {
            console.error("Error applying to DB: ", error);
        }
    };

    return (
        <div className="jobs">
            <div className="jobs__header">
                <h2>Recommended for you</h2>
                <p>Based on your profile and search history</p>
            </div>

            <div className="jobs__list">
                {jobs.map(job => (
                    <div key={job.id} className="jobs__listing">
                        <div className="jobs__listingInfo">
                            <h3>{job.title}</h3>
                            <p>{job.company}</p>
                            <p className="jobs__location">{job.location}</p>
                        </div>
                        <button
                            disabled={appliedJobs.includes(job.id)}
                            onClick={() => applyToJob(job.id, job.company)}
                            style={{ opacity: appliedJobs.includes(job.id) ? 0.5 : 1 }}
                        >
                            {appliedJobs.includes(job.id) ? 'Applied' : 'Easy Apply'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Jobs;
