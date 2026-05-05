import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, PhoneCall, MessageSquare, Search, Send, X } from "lucide-react";

const SupportPage = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const faqs = [
    { q: "How can I create an event?", a: "A user can create an event by clicking the 'Create Event' button and providing details like name, date, and location." },
    { q: "How will I receive my ticket?", a: "After registration, you will receive a QR code ticket via your registered WhatsApp number or Email." },
    { q: "Can I get a refund?", a: "Refund policies are set by individual event organizers. Please check the 'Terms' section on your specific ticket." },
    { q: "What if an event gets cancelled?", a: "If an event is cancelled, all participants will be notified immediately and issued a full refund." }
  ];

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          {/* Header Section */}
          <div className="text-center mb-5">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="fw-bold display-5"
            >
              How can we <span className="text-primary text-gradient">Help?</span>
            </motion.h2>
            <p className="text-muted">Search our knowledge base or contact our team directly.</p>
            
            <div className="mt-4 position-relative mx-auto" style={{ maxWidth: "500px" }}>
              <input 
                type="text" 
                className="form-control form-control-lg rounded-pill shadow-sm ps-4 pe-5" 
                placeholder="Search for 'Create Event' or 'Refunds'..." 
                style={{ paddingRight: "110px" }} 
              />
              <button 
                className="btn btn-primary position-absolute end-0 top-50 translate-middle-y me-2 rounded-pill px-3 btn-sm d-flex align-items-center gap-2"
                style={{ height: "calc(100% - 12px)", zIndex: 5 }}
              >
                <Search size={16} />
                <span>Search</span>
              </button>
            </div>
          </div>

          <div className="row g-4">
            {/* Quick Contact Cards */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 text-center h-100 rounded-4 backdrop-blur">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3 mx-auto">
                  <Mail size={32} className="text-primary" />
                </div>
                <h5 className="fw-bold">Email Us</h5>
                <p className="small text-muted">Response within 24 hours.</p>
                <a href="mailto:support@celebookems.com" className="btn btn-outline-primary btn-sm rounded-pill w-100 text-truncate">
                  support@celebookems.com
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 text-center h-100 rounded-4 backdrop-blur">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3 mx-auto">
                  <PhoneCall size={32} className="text-info" />
                </div>
                <h5 className="fw-bold">Call Us</h5>
                <p className="small text-muted">Mon - Fri, 9am - 6pm.</p>
                <button className="btn btn-outline-info btn-sm rounded-pill w-100">
                  +91 9640457670
                </button>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm p-4 text-center h-100 rounded-4 backdrop-blur">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3 mx-auto">
                  <MessageSquare size={32} className="text-success" />
                </div>
                <h5 className="fw-bold">Give Feedback</h5>
                <p className="small text-muted">Write your opinion about our website.</p>
                <button className="btn btn-outline-success btn-sm rounded-pill w-100">
                  Submit Feedback
                </button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="col-12 mt-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="card border-0 shadow-lg rounded-4 p-4 p-md-5 backdrop-blur"
              >
                <h4 className="fw-bold mb-4">Frequently Asked Questions</h4>
                <div className="accordion accordion-flush" id="faqAccordion">
                  {faqs.map((faq, index) => (
                    <div className="accordion-item bg-transparent" key={index}>
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed bg-transparent fw-bold py-3 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${index}`}>
                          {faq.q}
                        </button>
                      </h2>
                      <div id={`faq${index}`} className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                        <div className="accordion-body text-muted">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING CHAT COMPONENT --- */}
      <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              className="card border-0 shadow-lg rounded-4 mb-3 overflow-hidden"
              style={{ width: "320px" }}
            >
              <div className="card-header bg-primary text-white p-3 border-0 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0 fw-bold">Support AI Bot</h6>
                  <small className="opacity-75">Online | Powered by CeleBook</small>
                </div>
                <button onClick={() => setChatOpen(false)} className="btn-close btn-close-white shadow-none"></button>
              </div>
              <div className="card-body bg-light" style={{ height: "300px", overflowY: "auto" }}>
                <div className="bg-white p-2 rounded-3 shadow-sm small mb-2 d-inline-block border">
                  Hello! How can I help you today?
                </div>
              </div>
              <div className="card-footer bg-white border-0 p-3">
                <div className="input-group">
                  <input type="text" className="form-control rounded-start-pill border-light-subtle" placeholder="Type a message..." />
                  <button className="btn btn-primary rounded-end-pill px-3">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(!chatOpen)}
          className={`btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center ${chatOpen ? 'bg-danger border-danger' : ''}`}
          style={{ width: "60px", height: "60px" }}
        >
          {chatOpen ? <X size={30} /> : <MessageSquare size={28} />}
        </motion.button>
      </div>
    </div>
  );
};

export default SupportPage;