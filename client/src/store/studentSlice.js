import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../services/api'

// Async thunks
export const fetchStudents = createAsyncThunk('students/fetchAll', async () => {
	const res = await api.get('/students/')
	return res.data
})

export const fetchClusters = createAsyncThunk(
	'students/fetchClusters',
	async (nClusters = 3) => {
		const res = await api.get(`/clusters/?n_clusters=${nClusters}`)
		return res.data
	},
)

export const fetchElbow = createAsyncThunk('students/fetchElbow', async () => {
	const res = await api.get('/clusters/elbow')
	return res.data
})

export const fetchCorrelation = createAsyncThunk(
	'students/fetchCorrelation',
	async () => {
		const res = await api.get('/students/correlation')
		return res.data
	},
)

export const fetchClusteringComparison = createAsyncThunk(
	'students/fetchComparison',
	async ({ nClusters = 3, eps = null, minSamples = 5 } = {}) => {
		const params = new URLSearchParams()
		params.append('n_clusters', nClusters)
		if (eps !== null) params.append('eps', eps)
		params.append('min_samples', minSamples)
		const res = await api.get(`/clusters/compare?${params.toString()}`)
		return res.data
	},
)

export const predictStudent = createAsyncThunk(
	'students/predict',
	async data => {
		const res = await api.post('/predict/', data)
		return res.data
	},
)

export const retrainModels = createAsyncThunk('students/retrain', async () => {
	const res = await api.post('/students/retrain')
	return res.data
})

const studentSlice = createSlice({
	name: 'students',
	initialState: {
		// Dataset
		students: [],
		summary: null,
		loadingStudents: false,

		// Clustering
		clusters: null,
		clusterStats: [],
		nClusters: 3,
		loadingClusters: false,

		// Elbow
		elbowData: null,
		loadingElbow: false,

		// Correlation
		correlationData: null,
		loadingCorrelation: false,

		// Clustering Comparison
		comparisonData: null,
		loadingComparison: false,

		// Prediction
		prediction: null,
		loadingPrediction: false,

		// Retrain
		retraining: false,
		retrainSuccess: false,

		// Error
		error: null,
	},
	reducers: {
		setNClusters: (state, action) => {
			state.nClusters = action.payload
		},
		clearPrediction: state => {
			state.prediction = null
		},
		clearError: state => {
			state.error = null
		},
	},
	extraReducers: builder => {
		// Fetch students
		builder
			.addCase(fetchStudents.pending, state => {
				state.loadingStudents = true
			})
			.addCase(fetchStudents.fulfilled, (state, action) => {
				state.loadingStudents = false
				state.students = action.payload.students
				state.summary = action.payload.summary
			})
			.addCase(fetchStudents.rejected, (state, action) => {
				state.loadingStudents = false
				state.error = action.error.message
			})

		// Fetch clusters
		builder
			.addCase(fetchClusters.pending, state => {
				state.loadingClusters = true
			})
			.addCase(fetchClusters.fulfilled, (state, action) => {
				state.loadingClusters = false
				state.clusters = action.payload
				state.clusterStats = action.payload.cluster_stats
			})
			.addCase(fetchClusters.rejected, (state, action) => {
				state.loadingClusters = false
				state.error = action.error.message
			})

		// Elbow
		builder
			.addCase(fetchElbow.pending, state => {
				state.loadingElbow = true
			})
			.addCase(fetchElbow.fulfilled, (state, action) => {
				state.loadingElbow = false
				state.elbowData = action.payload
			})
			.addCase(fetchElbow.rejected, state => {
				state.loadingElbow = false
			})

		// Correlation
		builder
			.addCase(fetchCorrelation.pending, state => {
				state.loadingCorrelation = true
			})
			.addCase(fetchCorrelation.fulfilled, (state, action) => {
				state.loadingCorrelation = false
				state.correlationData = action.payload
			})
			.addCase(fetchCorrelation.rejected, state => {
				state.loadingCorrelation = false
			})

		// Clustering Comparison
		builder
			.addCase(fetchClusteringComparison.pending, state => {
				state.loadingComparison = true
				state.comparisonData = null
			})
			.addCase(fetchClusteringComparison.fulfilled, (state, action) => {
				state.loadingComparison = false
				state.comparisonData = action.payload
			})
			.addCase(fetchClusteringComparison.rejected, (state, action) => {
				state.loadingComparison = false
				state.error = action.error.message
			})

		// Prediction
		builder
			.addCase(predictStudent.pending, state => {
				state.loadingPrediction = true
				state.prediction = null
			})
			.addCase(predictStudent.fulfilled, (state, action) => {
				state.loadingPrediction = false
				state.prediction = action.payload
			})
			.addCase(predictStudent.rejected, (state, action) => {
				state.loadingPrediction = false
				state.error = action.error.message
			})

		// Retrain
		builder
			.addCase(retrainModels.pending, state => {
				state.retraining = true
				state.retrainSuccess = false
			})
			.addCase(retrainModels.fulfilled, state => {
				state.retraining = false
				state.retrainSuccess = true
			})
			.addCase(retrainModels.rejected, state => {
				state.retraining = false
			})
	},
})

export const { setNClusters, clearPrediction, clearError } =
	studentSlice.actions
export default studentSlice.reducer
