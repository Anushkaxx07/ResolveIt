import React, { useState } from 'react';
import {
  FileText,
  Send,
  Building,
  Tag,
  AlertTriangle,
  User,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function TicketForm({
  categories = [],
  currentUser,
  onSubmitTicket,
  onCancel,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('IT');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['IT', 'HR', 'Facilities', 'Finance', 'Access Management'];
  const departmentCategories = categories.filter((c) => c.Department === selectedDepartment);

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters';
    }

    if (!description.trim()) {
      errs.description = 'Description is required';
    } else if (description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }

    if (!categoryId) {
      errs.category = 'Please select a specific category';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmitTicket({
        Title: title.trim(),
        Description: description.trim(),
        CategoryId: Number(categoryId),
        Priority: priority,
      });
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit ticket' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Tickets</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Support Request</h2>
          <p className="text-xs text-slate-500 mt-1">
            Submit an employee request to IT, HR, Facilities, Finance, or Access Management.
          </p>
        </div>

        {errors.form && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Target Department <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {departments.map((dept) => {
                const isSelected = selectedDepartment === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setCategoryId('');
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-colors text-center ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Issue Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
                className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <option value="">Select a Category</option>
                {departmentCategories.map((c) => (
                  <option key={c.CategoryId} value={c.CategoryId}>
                    {c.Name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Ticket Subject / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Brief summary of the issue..."
              className={`w-full px-3.5 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="Please provide details, steps to reproduce, or any relevant error codes..."
              className={`w-full p-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
