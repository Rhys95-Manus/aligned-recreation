import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm mb-10">
            Last Updated: May 4, 2025 &nbsp;|&nbsp; Effective Date: May 4, 2025
          </p>

          <p className="text-slate-300 leading-relaxed">
            Aligned Motion ("Company," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and related services (collectively, the "Service"). Please read this Privacy Policy carefully. By accessing or using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>

          {/* Section 1 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-200">1.1 Camera and Video Input</h3>
          <p className="text-slate-300 leading-relaxed">
            The Service uses your device's camera to capture video of your physical movements in real time. This video data is processed to extract body landmark and motion data for biomechanical analysis. Depending on the feature and your device capabilities, video may be processed locally on your device, streamed to our servers for processing, or temporarily stored for analysis purposes. We do not permanently store raw video footage unless you explicitly choose to save a recording within the Service.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-200">1.2 Body Landmark and Motion Data</h3>
          <p className="text-slate-300 leading-relaxed">
            We collect and process body landmark data, including joint positions, angles, velocities, and movement patterns derived from your camera input. This data is used to provide motion analysis, feedback, and scoring. Motion data may be stored in association with your account to provide session history, progress tracking, and personalized recommendations.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-200">1.3 Account Information</h3>
          <p className="text-slate-300 leading-relaxed">
            When you create an account, we collect information such as your email address, display name, and authentication credentials. If you sign in through a third-party authentication provider, we may receive your name, email address, and profile identifier from that provider.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-200">1.4 Device and Browser Information</h3>
          <p className="text-slate-300 leading-relaxed">
            We automatically collect certain technical information, including your device type, operating system, browser type and version, screen resolution, IP address, unique device identifiers, and general location data (city/region level). This information helps us optimize the Service for your device and troubleshoot technical issues.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-slate-200">1.5 Usage Data</h3>
          <p className="text-slate-300 leading-relaxed">
            We collect information about how you interact with the Service, including pages visited, features used, session duration, exercise types performed, and performance metrics. This data helps us understand user behavior and improve the Service.
          </p>

          {/* Section 2 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">2. How We Use Your Information</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong>Motion Analysis:</strong> To process your movements, provide real-time feedback, generate scores, and deliver improvement suggestions.</li>
            <li><strong>Service Delivery:</strong> To operate, maintain, and provide the features and functionality of the Service.</li>
            <li><strong>Personalization:</strong> To tailor your experience, provide session history, and track your progress over time.</li>
            <li><strong>AI Model Improvement:</strong> To train, improve, and refine our artificial intelligence and machine learning models for better motion analysis accuracy. Motion data used for model training is aggregated and de-identified where feasible.</li>
            <li><strong>Product Optimization:</strong> To analyze usage patterns, identify bugs, and improve the overall performance and user experience of the Service.</li>
            <li><strong>Communication:</strong> To send you service-related notifications, updates, and promotional materials (with your consent where required).</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">3. Data Storage and Security</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            We implement industry-standard technical and organizational security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Encryption of data in transit (TLS/SSL) and at rest.</li>
            <li>Access controls and authentication requirements for internal systems.</li>
            <li>Regular security assessments and monitoring.</li>
            <li>Secure cloud infrastructure provided by reputable third-party hosting providers.</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            While we strive to protect your information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.
          </p>

          {/* Section 4 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">4. Video Processing and Storage</h2>
          <p className="text-slate-300 leading-relaxed">
            The Service is designed to process video input primarily for the purpose of extracting motion and body landmark data. Depending on the feature, processing may occur locally on your device or on our servers. Raw video data is not permanently stored on our servers unless you explicitly choose to save a recording. When video is processed server-side, it is temporarily held in memory or short-term storage only for the duration necessary to complete the analysis, after which it is automatically deleted. Saved recordings, if any, are stored securely and associated with your account.
          </p>

          {/* Section 5 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">5. Third-Party Services</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            We may share information with or use the following categories of third-party service providers:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong>AI and Machine Learning Providers:</strong> To power our motion analysis capabilities, we may use third-party AI services that process motion data on our behalf.</li>
            <li><strong>Cloud Infrastructure:</strong> We use cloud hosting and storage providers to securely store and process data.</li>
            <li><strong>Analytics Tools:</strong> We use analytics services to understand how the Service is used and to improve performance.</li>
            <li><strong>Payment Processors:</strong> If you purchase a subscription, your payment information is processed by third-party payment providers. We do not store your full credit card number.</li>
            <li><strong>Authentication Providers:</strong> We may use third-party authentication services to manage user sign-in.</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            These third-party providers are contractually obligated to protect your information and may only use it for the purposes we specify.
          </p>

          {/* Section 6 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">6. Your Rights</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Depending on your jurisdiction, you may have the following rights regarding your personal information:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li><strong>Access:</strong> You may request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> You may request that we correct inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> You may request that we delete your personal information, subject to certain legal exceptions.</li>
            <li><strong>Data Portability:</strong> You may request a copy of your data in a structured, machine-readable format.</li>
            <li><strong>Opt-Out:</strong> You may opt out of promotional communications at any time.</li>
            <li><strong>Withdraw Consent:</strong> Where processing is based on consent, you may withdraw consent at any time.</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            To exercise any of these rights, please contact us through the Aligned Motion platform. We will respond to your request within 30 days or as required by applicable law.
          </p>

          {/* Section 7 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">7. Children's Privacy</h2>
          <p className="text-slate-300 leading-relaxed">
            The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13 without parental consent, we will take steps to delete that information promptly. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can take appropriate action.
          </p>

          {/* Section 8 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">8. Data Retention</h2>
          <p className="text-slate-300 leading-relaxed">
            We retain your personal information for as long as your account is active or as needed to provide you with the Service. We may also retain certain information as necessary to comply with legal obligations, resolve disputes, enforce our agreements, and for legitimate business purposes. When your data is no longer needed, we will securely delete or anonymize it. Motion analysis data associated with your account will be retained for the duration of your account's existence unless you request deletion.
          </p>

          {/* Section 9 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">9. Cookies and Tracking Technologies</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            The web version of the Service uses cookies and similar tracking technologies to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>Maintain your session and authentication state.</li>
            <li>Remember your preferences and settings.</li>
            <li>Analyze usage patterns and Service performance.</li>
            <li>Deliver relevant content and features.</li>
          </ul>
          <p className="text-slate-300 leading-relaxed mt-4">
            You can control cookie settings through your browser preferences. Disabling cookies may limit certain features of the Service. We do not use cookies for third-party advertising purposes.
          </p>

          {/* Section 10 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">10. International Users</h2>
          <p className="text-slate-300 leading-relaxed">
            The Service is operated from the United States. If you are accessing the Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States or other countries where our service providers operate. By using the Service, you consent to the transfer of your information to countries that may have different data protection laws than your country of residence. We will take appropriate measures to ensure your information receives an adequate level of protection in accordance with applicable data protection laws.
          </p>

          {/* Section 11 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">11. Changes to This Privacy Policy</h2>
          <p className="text-slate-300 leading-relaxed">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. We will notify you of material changes by posting the updated policy on the Service and updating the "Last Updated" date. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Privacy Policy.
          </p>

          {/* Section 12 */}
          <h2 className="text-2xl font-bold mt-10 mb-4 text-white">12. Contact Us</h2>
          <p className="text-slate-300 leading-relaxed">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us through the Aligned Motion platform. We are committed to resolving any privacy-related issues promptly and transparently.
          </p>

          <div className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-slate-400 text-sm">
              By using Aligned Motion, you acknowledge that you have read, understood, and agree to this Privacy Policy.
            </p>
          </div>
        </article>
      </main>

      <footer className="bg-[#050810] border-t border-slate-800/50 py-6 px-8">
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm">Aligned Motion</div>
          <div className="flex gap-6 text-sm">
            <span className="text-slate-500">
              Privacy Policy
            </span>
            <span className="text-slate-500">|</span>
            <span
              className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
              onClick={() => setLocation("/terms")}
            >
              Terms of Service
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
