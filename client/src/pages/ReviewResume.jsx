import { FileText, Sparkles, AlertCircle, RotateCcw, X, UploadCloud, CheckCircle2 } from 'lucide-react'
import React, { useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@clerk/clerk-react'
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const ReviewResume = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setError('')

    // Validate file type
    const isPdf =
      selected.type === 'application/pdf' ||
      selected.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      const msg = 'Only PDF resumes are supported.'
      setError(msg)
      toast.error(msg)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFile(null)
      return
    }

    // Validate file size (5MB max)
    if (selected.size > 5 * 1024 * 1024) {
      const msg = 'Resume file size exceeds the allowed limit (5MB).'
      setError(msg)
      toast.error(msg)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFile(null)
      return
    }

    setFile(selected)
  }

  const handleClearFile = () => {
    setFile(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleReset = () => {
    setFile(null)
    setContent('')
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (loading) return

    if (!file) {
      const msg = 'Please upload a resume (PDF)'
      setError(msg)
      toast.error(msg)
      return
    }

    try {
      setLoading(true)
      setError('')

      const formData = new FormData()
      formData.append('resume', file)

      const token = await getToken()
      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (data.success) {
        setContent(data.data?.content || data.content || 'No analysis returned.')
        toast.success('Resume reviewed successfully!')
      } else {
        const errorMsg = data.message || 'Failed to review resume.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'An error occurred while reviewing the resume.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-scroll p-6 flex gap-6 flex-col lg:flex-row text-slate-700">
      {/* left col: Upload & Controls */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full lg:w-1/2 p-5 bg-white rounded-lg border border-gray-200 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 text-[#00DA83]" />
            <h1 className="text-xl font-semibold">Resume Review</h1>
          </div>

          <p className="mt-6 text-sm font-medium">Upload Resume</p>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            type="file"
            className="hidden"
            id="resume-upload-input"
          />

          {/* Upload Area / Selected File Preview */}
          {!file ? (
            <label
              htmlFor="resume-upload-input"
              className="mt-2 border-2 border-dashed border-gray-300 hover:border-[#00DA83] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition bg-gray-50/50 hover:bg-emerald-50/30"
            >
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to browse or choose a file
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports PDF resumes only (Max 5MB)
              </p>
            </label>
          ) : (
            <div className="mt-2 p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded bg-[#00DA83]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#00DA83]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • PDF Ready
                  </p>
                </div>
              </div>
              {!loading && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 cursor-pointer transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={loading || !file}
            className={`w-full flex justify-center items-center gap-2 text-white px-4 py-2.5 text-sm font-medium rounded-lg transition shadow-sm ${
              loading || !file
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#00DA83] to-[#009BB3] hover:opacity-95 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Review Resume</span>
              </>
            )}
          </button>

          {content && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full flex justify-center items-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 text-sm rounded-lg cursor-pointer transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Review Another Resume</span>
            </button>
          )}
        </div>
      </form>

      {/* right col: Analysis Results */}
      <div className="w-full lg:w-1/2 p-5 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[650px] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#00DA83]" />
            <h1 className="text-xl font-semibold">Analysis Results</h1>
          </div>
          {content && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Review</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center py-12">
            <div className="w-12 h-12 rounded-full border-3 border-[#00DA83]/30 border-t-[#00DA83] animate-spin mb-4"></div>
            <p className="text-sm font-medium text-gray-700">
              AI is reviewing your resume...
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
              Extracting text, evaluating key strengths, ATS compatibility, and improvement areas.
            </p>
          </div>
        ) : !content ? (
          <div className="flex-1 flex justify-center items-center py-12">
            <div className="text-sm flex flex-col items-center gap-3 text-gray-400 text-center max-w-xs">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-medium text-gray-600">No review yet</p>
              <p className="text-xs text-gray-400">
                Upload a PDF resume and click "Review Resume" to get comprehensive AI feedback.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-700 leading-relaxed overflow-y-auto pr-1">
            <div className="reset-tw prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewResume
