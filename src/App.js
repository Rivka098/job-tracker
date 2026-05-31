import { useEffect, useMemo, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'job-tracker-jobs';

const interviewStatuses = ['לא נקבע', 'מוזמן לראיון', 'עבר', 'נדחה'];

const initialFormState = {
	company: '',
	title: '',
	details: '',
	applyDate: '',
	method: '',
};

function createJobId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadJobs() {
	if (typeof window === 'undefined') {
		return [];
	}

	try {
		const storedValue = window.localStorage.getItem(STORAGE_KEY);
		if (!storedValue) {
			return [];
		}

		const parsedJobs = JSON.parse(storedValue);
		return Array.isArray(parsedJobs) ? parsedJobs : [];
	} catch {
		return [];
	}
}

function App() {
	const [jobs, setJobs] = useState(loadJobs);
	const [formData, setFormData] = useState(initialFormState);
	const [expandedJobs, setExpandedJobs] = useState([]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
	}, [jobs]);

	const jobsCount = useMemo(() => jobs.length, [jobs.length]);

	function handleFormChange(event) {
		const { name, value } = event.target;
		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}));
	}

	function handleAddJob(event) {
		event.preventDefault();

		if (!formData.company.trim() || !formData.title.trim()) {
			return;
		}

		const newJob = {
			id: createJobId(),
			company: formData.company.trim(),
			title: formData.title.trim(),
			details: formData.details.trim(),
			applyDate: formData.applyDate,
			method: formData.method.trim(),
			response: 'לא חזרו עדיין',
			interviewDate: '',
			interviewStatus: 'לא נקבע',
		};

		setJobs((currentJobs) => [newJob, ...currentJobs]);
		setFormData(initialFormState);
	}

	function updateJob(jobId, field, value) {
		setJobs((currentJobs) =>
			currentJobs.map((job) => (job.id === jobId ? { ...job, [field]: value } : job)),
		);
	}

	function toggleExpanded(jobId) {
		setExpandedJobs((currentExpandedJobs) =>
			currentExpandedJobs.includes(jobId)
				? currentExpandedJobs.filter((expandedJobId) => expandedJobId !== jobId)
				: [...currentExpandedJobs, jobId],
		);
	}

	function removeJob(jobId) {
		setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
		setExpandedJobs((currentExpandedJobs) => currentExpandedJobs.filter((id) => id !== jobId));
	}

	return (
		<main className="app-shell" dir="rtl">
			<section className="hero-panel">
				<div>
					<p className="eyebrow">Job Tracker</p>
					<h1>ניהול חיפוש עבודה</h1>
				</div>

				<div className="summary-card">
					<span>משרות שמורות</span>
					<strong>{jobsCount}</strong>
				</div>
			</section>

			<section className="form-card">
				<div className="section-title">
					<h2>הוספת משרה חדשה</h2>
				</div>

				<form className="job-form" onSubmit={handleAddJob}>
					<label>
						חברה
						<input
							name="company"
							value={formData.company}
							onChange={handleFormChange}
							placeholder="למשל: Google"
						/>
					</label>

					<label>
						תפקיד
						<input
							name="title"
							value={formData.title}
							onChange={handleFormChange}
							placeholder="למשל: Frontend Developer"
						/>
					</label>

					<label className="full-width">
						פרטי משרה
						<textarea
							name="details"
							value={formData.details}
							onChange={handleFormChange}
							placeholder="תיאור התפקיד, הניסיון הנדרש, טכנולוגיות, וכל מידע נוסף..."
							rows="5"
						/>
					</label>

					<label>
						תאריך הגשה
						<input type="date" name="applyDate" value={formData.applyDate} onChange={handleFormChange} />
					</label>

					<label>
						דרך הגשה
						<input
							name="method"
							value={formData.method}
							onChange={handleFormChange}
							placeholder="למשל: LinkedIn, אתר החברה, מייל"
						/>
					</label>

					<button className="primary-button" type="submit">
						+ הוספת משרה
					</button>
				</form>
			</section>

			<section className="jobs-section">
				<div className="section-title">
					<h2>המשרות שלי</h2>
				</div>

				<div className="jobs-list">
					{jobs.length === 0 ? (
						<div className="empty-state">
							<h3>עדיין אין משרות</h3>
							<p>הוסף את המשרה הראשונה שלך למעלה כדי להתחיל לעקוב אחרי החיפושים.</p>
						</div>
					) : (
						jobs.map((job) => {
							const isExpanded = expandedJobs.includes(job.id);
							const preview = job.details.length > 170 ? `${job.details.slice(0, 170)}...` : job.details;

							return (
								<article className="job-card" key={job.id}>
									<header className="job-header">
										<div>
											<p className="job-company">{job.company}</p>
											<h3>{job.title}</h3>
										</div>

										<button className="ghost-button" type="button" onClick={() => removeJob(job.id)}>
											מחק
										</button>
									</header>

									<div className="job-details">
										<p className="job-label">פרטי משרה</p>
										<p className="job-text">{isExpanded ? job.details : preview}</p>
										{job.details.length > 170 && (
											<button className="text-button" type="button" onClick={() => toggleExpanded(job.id)}>
												{isExpanded ? 'הצג פחות' : 'קרא עוד'}
											</button>
										)}
									</div>

									<div className="meta-grid">
										<div>
											<span>תאריך הגשה</span>
											<strong>{job.applyDate || 'לא צוין'}</strong>
										</div>
										<div>
											<span>דרך הגשה</span>
											<strong>{job.method || 'לא צוין'}</strong>
										</div>
										<div>
											<span>האם חזרו אלי</span>
											<select
												value={job.response}
												onChange={(event) => updateJob(job.id, 'response', event.target.value)}
											>
												<option>לא חזרו עדיין</option>
												<option>כן</option>
												<option>לא</option>
											</select>
										</div>
										<div>
											<span>תאריך ראיון</span>
											<input
												type="date"
												value={job.interviewDate}
												onChange={(event) => updateJob(job.id, 'interviewDate', event.target.value)}
											/>
										</div>
										<div>
											<span>סטטוס ראיון</span>
											<select
												value={job.interviewStatus}
												onChange={(event) => updateJob(job.id, 'interviewStatus', event.target.value)}
											>
												{interviewStatuses.map((status) => (
													<option key={status} value={status}>
														{status}
													</option>
												))}
											</select>
										</div>
									</div>
								</article>
							);
						})
					)}
				</div>
			</section>
		</main>
	);
}

export default App;
