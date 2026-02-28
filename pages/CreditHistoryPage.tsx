import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Coins, Send, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient, { UserCreditRequest } from "@/services/api";
import { toast } from "sonner";
import Header from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CreditHistoryPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<UserCreditRequest[]>([]);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState("I would like to request more credits for my project.");
  const [requestAmount, setRequestAmount] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCreditHistory();
  }, []);

  const loadCreditHistory = async () => {
    try {
      const data = await apiClient.getUserCreditRequests();
      setRequests(data.requests);
      setTotalCreditsUsed(data.totalCreditsUsed);
    } catch (error: any) {
      toast.error(error.message || "Failed to load credit history");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestAmount <= 0) {
      toast.error("Please request a valid number of credits");
      return;
    }
    
    setSubmitting(true);
    try {
      await apiClient.requestCredits(requestMessage, requestAmount);
      toast.success("Credit request submitted successfully!");
      setIsDialogOpen(false);
      loadCreditHistory(); // reload to show the new pending request
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          label: "Approved",
        };
      case "denied":
        return {
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          label: "Denied",
        };
      default:
        return {
          icon: Clock,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          label: "Pending",
        };
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <div className="container max-w-4xl mx-auto px-6 pt-32">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to App
            </button>
            <h1 className="text-3xl font-display font-semibold text-foreground flex items-center gap-4">
              Credit Request History
            </h1>
            <p className="text-muted-foreground mt-2">
              View your past requests for additional credits and their current status.
            </p>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" /> Request More Credits
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleRequestSubmit}>
                  <DialogHeader>
                    <DialogTitle>Request Credits</DialogTitle>
                    <DialogDescription>
                      Ask an admin for more generation credits.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="amount" className="text-sm font-medium">
                        Number of Credits
                      </label>
                      <input
                        id="amount"
                        type="number"
                        min="1"
                        max="500"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(parseInt(e.target.value) || 0)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message to Admin
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Submit Request
                        </>
                      )}
                    </button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

          </div>

          <div className="glass-card border border-primary/20 bg-primary/5 rounded-xl p-4 flex items-center gap-4 shrink-0 mt-4 md:mt-10">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Credits Used</p>
              <p className="text-2xl font-bold text-foreground font-mono">
                {loading ? "..." : totalCreditsUsed}
              </p>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="login-spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 glass-card rounded-2xl border border-border/50"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Requests Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              You haven't made any requests for additional credits yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {requests.map((request, idx) => {
              const status = getStatusConfig(request.status);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card rounded-xl p-5 border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.bg} ${status.color} ${status.border} border`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {request.createdAt ? new Date(request.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Unknown Date'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium bg-secondary/50 px-3 py-1 rounded-full text-foreground/80">
                          Requested: <span className="text-foreground">{request.requestedCredits || 0}</span>
                        </div>
                        {request.status === 'approved' && request.approvedCredits !== undefined && (
                          <div className="text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
                            Approved: <span className="font-bold">{request.approvedCredits}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed mt-1">
                      "{request.message}"
                    </p>
                    {request.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Reviewed on {new Date(request.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditHistoryPage;
