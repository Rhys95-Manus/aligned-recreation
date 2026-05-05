import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100">
      <Header />

      <main className="max-w-[900px] mx-auto px-6 md:px-8 py-12 pb-32">
        <Button
          variant="outline"
          onClick={() => setLocation("/")}
          className="mb-8 !border-2 !border-slate-600 bg-transparent text-white hover:bg-slate-600/10 rounded-lg px-4 py-2"
        >
          &larr; Back
        </Button>

        <article className="prose prose-invert prose-slate max-w-none">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm mb-10">
            Last Updated: May 4, 2025 &nbsp;|&nbsp; Effective Date: May 4, 2025
          </p>

          <p className="text-slate-300 leading-relaxed">
            Welcome to Aligned Motion. These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Aligned Motion ("Company," "we," "us," or "our"). By accessing or using the Aligned Motion platform, mobile application, or website (collectively, the "Service"), you agree to be bound by these Terms. If you do not agree, you must not access or use the Service.
          </p>

          {/* Section 1 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">1. Acceptance of Terms</h2>
          <p className="text-slate-300 leading-relaxed">
            By creating an account, accessing, or using any part of the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. We reserve the right to modify these Terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised Terms.
          </p>

          {/* Section 2 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">2. Eligibility</h2>
          <p className="text-slate-300 leading-relaxed">
            You must be at least 18 years of age to use the Service. If you are between 13 and 17 years of age, you may only use the Service with the consent and supervision of a parent or legal guardian who agrees to be bound by these Terms. The Service is not intended for children under 13 years of age, and we do not knowingly collect information from children under 13.
          </p>

          {/* Section 3 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">3. Description of Service</h2>
          <p className="text-slate-300 leading-relaxed">
            Aligned Motion is an AI-powered biomechanics and motion analysis platform. The Service uses device cameras and computer vision technology to track body movement, analyze biomechanics (including joint angles, posture, and motion efficiency), compare user motion to professional reference data, and provide feedback, scoring, and improvement suggestions. The Service is designed for informational and educational purposes only.
          </p>

          {/* Section 4 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">4. User Responsibilities</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            By using the Service, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Perform all physical movements in a safe environment with adequate space, proper flooring, and appropriate equipment.</li>
            <li>Ensure your physical surroundings are free from hazards before engaging in any movement while using the Service.</li>
            <li>Consult with a qualified healthcare professional before beginning any exercise program or physical activity.</li>
            <li>Not use the Service while impaired, fatigued, injured, or in any condition that may increase the risk of injury.</li>
            <li>Provide accurate account information and maintain the security of your login credentials.</li>
            <li>Use the Service only for its intended purpose and in compliance with all applicable laws.</li>
          </ul>

          {/* Section 5 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">5. Assumption of Risk</h2>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 my-6">
            <p className="text-slate-200 leading-relaxed font-semibold mb-4">
              IMPORTANT — PLEASE READ CAREFULLY:
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              PHYSICAL ACTIVITY CARRIES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO MUSCLE STRAINS, SPRAINS, FRACTURES, JOINT INJURIES, CARDIOVASCULAR EVENTS, AND IN RARE CASES, DEATH. BY USING THE SERVICE, YOU EXPRESSLY ACKNOWLEDGE AND ASSUME ALL RISKS ASSOCIATED WITH ENGAGING IN PHYSICAL ACTIVITY, WHETHER OR NOT SUCH ACTIVITY IS PERFORMED IN CONNECTION WITH THE SERVICE.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              YOU UNDERSTAND AND AGREE THAT ALIGNED MOTION IS NOT RESPONSIBLE FOR ANY INJURY, ILLNESS, DISABILITY, OR DEATH THAT MAY RESULT FROM YOUR USE OF THE SERVICE OR YOUR PARTICIPATION IN ANY PHYSICAL ACTIVITY. YOU VOLUNTARILY ASSUME FULL RESPONSIBILITY FOR ANY AND ALL RISKS OF LOSS, PROPERTY DAMAGE, OR PERSONAL INJURY, INCLUDING DEATH, THAT MAY BE SUSTAINED AS A RESULT OF ENGAGING IN ANY PHYSICAL ACTIVITY.
            </p>
            <p className="text-slate-300 leading-relaxed">
              THIS ASSUMPTION OF RISK APPLIES REGARDLESS OF WHETHER THE INJURY OR DAMAGE IS CAUSED BY THE NEGLIGENCE OF ALIGNED MOTION, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES, OR BY ANY OTHER CAUSE.
            </p>
          </div>

          {/* Section 6 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">6. No Medical Advice Disclaimer</h2>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 my-6">
            <p className="text-slate-200 leading-relaxed font-semibold mb-4">
              THE SERVICE IS NOT MEDICAL ADVICE.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              Aligned Motion does not provide medical advice, physical therapy, injury prevention services, or rehabilitation guidance. The Service is not a substitute for professional medical advice, diagnosis, treatment, or the services of a qualified physician, physical therapist, athletic trainer, or coach.
            </p>
            <p className="text-slate-300 leading-relaxed mb-4">
              The feedback, scores, and suggestions provided by the Service are generated by artificial intelligence algorithms and are intended solely for informational and educational purposes. They should not be relied upon as a basis for medical decisions or as a guarantee of performance improvement or injury avoidance.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition, physical limitations, or fitness program. Never disregard professional medical advice or delay seeking it because of information provided by the Service.
            </p>
          </div>

          {/* Section 7 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">7. Limitation of Liability</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ALIGNED MOTION, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUCCESSORS, OR ASSIGNS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            IN NO EVENT SHALL THE TOTAL AGGREGATE LIABILITY OF ALIGNED MOTION EXCEED THE GREATER OF (A) THE AMOUNT YOU HAVE PAID TO ALIGNED MOTION IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00 USD).
          </p>
          <p className="text-slate-300 leading-relaxed">
            THIS LIMITATION APPLIES REGARDLESS OF THE THEORY OF LIABILITY, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT ALIGNED MOTION HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          {/* Section 8 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">8. Indemnification</h2>
          <p className="text-slate-300 leading-relaxed">
            You agree to indemnify, defend, and hold harmless Aligned Motion and its officers, directors, employees, agents, affiliates, successors, and assigns from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party right, including any intellectual property or privacy right; (d) any injury or damage to yourself or any third party resulting from your physical activity in connection with the Service; or (e) any claim that your use of the Service caused damage to a third party.
          </p>

          {/* Section 9 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">9. AI and Accuracy Disclaimer</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            The Service utilizes artificial intelligence, machine learning, and computer vision technologies to analyze movement. You acknowledge and agree that:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>AI-generated results, feedback, scores, and recommendations may be inaccurate, incomplete, or inconsistent.</li>
            <li>Motion analysis data may not accurately reflect real-world biomechanical performance.</li>
            <li>Environmental factors (lighting, camera angle, clothing, background) may affect analysis accuracy.</li>
            <li>The Service is continuously evolving and results may vary between sessions.</li>
            <li>Comparisons to professional reference data are approximations and should not be treated as definitive assessments.</li>
            <li>No AI system is infallible, and you should not make health, safety, or performance decisions based solely on the Service's output.</li>
          </ul>

          {/* Section 10 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">10. Subscription and Payment Terms</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Aligned Motion may offer free and paid subscription plans. By selecting a paid plan, you agree to pay all applicable fees as described at the time of purchase. Subscription terms include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong>Recurring Subscriptions:</strong> Monthly subscriptions automatically renew at the end of each billing cycle unless cancelled prior to the renewal date.</li>
            <li><strong>Lifetime Deals:</strong> One-time payment plans grant access for the lifetime of the Service, subject to these Terms. "Lifetime" refers to the operational life of the Aligned Motion platform.</li>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial billing periods.</li>
            <li><strong>Price Changes:</strong> We reserve the right to modify pricing at any time. Existing subscribers will be notified of price changes at least 30 days in advance.</li>
            <li><strong>Refunds:</strong> All sales are final unless otherwise required by applicable law. Refund requests may be considered on a case-by-case basis at our sole discretion.</li>
          </ul>

          {/* Section 11 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">11. Termination</h2>
          <p className="text-slate-300 leading-relaxed">
            We reserve the right to suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Grounds for termination include, but are not limited to, violation of these Terms, fraudulent activity, abusive behavior, or any conduct that we determine, in our sole discretion, to be harmful to the Service or other users. Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, indemnification, and limitations of liability.
          </p>

          {/* Section 12 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">12. Intellectual Property</h2>
          <p className="text-slate-300 leading-relaxed">
            All content, features, functionality, software, data structures, algorithms, designs, trademarks, and intellectual property associated with the Service are and shall remain the exclusive property of Aligned Motion and its licensors. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial purposes in accordance with these Terms. You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works based on any part of the Service without our prior written consent.
          </p>

          {/* Section 13 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">13. Governing Law</h2>
          <p className="text-slate-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with the laws of the State of Florida, United States of America, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms shall be brought exclusively in the federal or state courts located in the State of Florida, and you hereby consent to the personal jurisdiction and venue of such courts.
          </p>

          {/* Section 14 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">14. Dispute Resolution and Arbitration</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association ("AAA") in accordance with its Commercial Arbitration Rules. The arbitration shall take place in the State of Florida. The arbitrator's decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            <strong>Class Action Waiver:</strong> YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. You waive any right to participate in a class action lawsuit or class-wide arbitration against Aligned Motion.
          </p>
          <p className="text-slate-300 leading-relaxed">
            <strong>Exception:</strong> Either party may bring an individual action in small claims court for disputes within the court's jurisdictional limits.
          </p>

          {/* Section 15 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">15. General Provisions</h2>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong>Entire Agreement:</strong> These Terms, together with the Privacy Policy, constitute the entire agreement between you and Aligned Motion regarding the Service.</li>
            <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</li>
            <li><strong>Waiver:</strong> The failure of Aligned Motion to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</li>
            <li><strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.</li>
            <li><strong>Contact:</strong> For questions about these Terms, please contact us through the Aligned Motion platform.</li>
          </ul>

          <div className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              By using Aligned Motion, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </div>
        </article>
      </main>

      <footer className="bg-[#050810] border-t border-slate-800/50 py-6 px-8">
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm">Aligned Motion</div>
          <div className="flex gap-6 text-sm">
            <span
              className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
              onClick={() => setLocation("/privacy")}
            >
              Privacy Policy
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-500">
              Terms of Service
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
