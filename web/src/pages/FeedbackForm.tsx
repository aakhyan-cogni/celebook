import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Star, Send, CheckCircle, Loader2 } from "lucide-react";
// TODO: Adjust this path to the actual location of your apiFetch utility function
import { apiFetch } from "../lib/api.ts";
import { feedbackFormSchema } from "../lib/validation/schemas";
import { useFormErrors } from "../lib/validation/useFormErrors";
import FieldError from "../lib/validation/FieldError";

interface FeedbackFormProps {
  onBack: () => void;
}

export default function FeedbackForm({ onBack }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // States for managing network communication
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { errors, validate, clear } = useFormErrors(feedbackFormSchema);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validate({ rating, message });
    if (!result.ok) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Replaced axios with your custom wrapper function apiFetch
      const responseData = await apiFetch("/feedback", {
        method: "POST",
        body: JSON.stringify({ rating, message }),
      });

      if (responseData.success) {
        setIsSubmitted(true);
      }
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      // apiFetch throws native Error instances, so we capture error.message directly
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card border-0 shadow-lg rounded-4 p-4 p-md-5 backdrop-blur text-center py-5"
      >
        <CheckCircle size={60} className="text-success mb-3 mx-auto" />
        <h3 className="fw-bold">Thank You!</h3>
        <p className="text-muted">Your feedback helps us make CeleBook better.</p>
        <button 
          onClick={onBack} 
          className="btn btn-primary rounded-pill px-4 mt-3 shadow-sm"
        >
          Return to Support
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card border-0 shadow-lg rounded-4 p-4 p-md-5 backdrop-blur"
    >
      {/* Back Header */}
      <button 
        type="button"
        onClick={onBack} 
        className="btn btn-link text-decoration-none p-0 mb-4 d-flex align-items-center gap-2 text-muted shadow-none"
        disabled={isLoading}
      >
        <ArrowLeft size={20} /> Back to Support
      </button>

      <h3 className="fw-bold mb-1">Share your <span className="text-success">Feedback</span></h3>
      <p className="text-muted mb-4">How can we improve your experience?</p>
      
      <form onSubmit={handleSubmit}>
        
        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="alert alert-danger rounded-3 small py-2 animate-fade-in" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Isolated Star Rating Box */}
        <div className="mb-4">
          <label className="form-label fw-bold small text-uppercase text-primary">Rating</label>
          <div className="d-flex gap-2 align-items-center" style={{ minHeight: "40px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.div
                key={star}
                whileHover={isLoading ? {} : { scale: 1.2 }}
                whileTap={isLoading ? {} : { scale: 0.9 }}
                onMouseEnter={() => !isLoading && setHover(star)}
                onMouseLeave={() => !isLoading && setHover(0)}
                onClick={() => { if (!isLoading) { setRating(star); clear("rating"); } }}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                className="transition-all"
              >
                <Star 
                  size={32} 
                  className={`transition-all ${
                    (hover || rating) >= star ? 'text-warning fill-warning' : 'text-light-subtle'
                  }`} 
                />
              </motion.div>
            ))}
            {rating > 0 && (
              <span className="ms-2 badge bg-warning text-dark rounded-pill py-1 px-2 fw-bold animate-fade-in">
                {rating} / 5
              </span>
            )}
          </div>
          <FieldError message={errors.rating} />
        </div>

        {/* Message Input */}
        <div className="mb-4">
          <label className="form-label fw-bold small text-uppercase text-info">Your Message</label>
          <textarea
            className={`form-control rounded-3 border-light-subtle shadow-sm p-3${errors.message ? " is-invalid" : ""}`}
            rows={4}
            value={message}
            onChange={(e) => { setMessage(e.target.value); clear("message"); }}
            placeholder="Tell us what you think or report an experience..."
            disabled={isLoading}
            aria-invalid={!!errors.message}
          ></textarea>
          <FieldError message={errors.message} />
          <div className="form-text small text-end">{message.length}/2000</div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="btn btn-success w-100 rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send size={18} /> Submit Feedback
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}