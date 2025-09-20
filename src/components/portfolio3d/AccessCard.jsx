// import Image from "next/image";
// import TerminalModal from "./TerminalModal";
// import { useState } from "react";

// const AccessCard = ({ positionId }) => {
//   if (positionId !== 2) return null;
//   const [modalOpen, setModalOpen] = useState(false);

//   const scriptData = [
//     { type: "normal", text: "Wellcome to my Life...\n" },
//     {
//       type: "error",
//       wrong: "my name i",
//       correct: "Hello, I'm Erfan!",
//     },
//     {
//       type: "normal",
//       text: "Take a walk with me through code and life :)",
//     },
//     {
//       type: "error",
//       wrong: "$ echo 'Let",
//       correct: "Let's make something awesome!",
//     },
//     { type: "normal", text: "Token successfully generated" },
//     {
//       type: "normal",
//       text: "\n",
//     },
//     {
//       type: "normal",
//       text: "Access granted",
//     },
//   ];

//   return (
//     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
//       <div className="transform -translate-x-[130px] -translate-y-[20px] w-17 h-17 flex items-center justify-center text-white rounded-md text-sm skew-y-17 -skew-x-7 -rotate-5">
//         <Image
//           src="/images/unlock.png"
//           alt="Access"
//           width={300}
//           height={300}
//           className="cursor-pointer transition-transform"
//           onClick={() => setModalOpen(true)}
//         />
//       </div>
//       {modalOpen && (
//         <div className="absolute left-full top-1/2 -translate-y-1/2 z-50">
//           <TerminalModal
//             open={true}
//             onClose={() => setModalOpen(false)}
//             className="fixed top-0 left-0 w-screen h-screen bg-black/70 z-[1000] flex items-center justify-start"
//           >
//             {scriptData}
//           </TerminalModal>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AccessCard;
