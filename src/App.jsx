import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>;
const CogIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2"><path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.905 1.523L9.017 8.429a1.875 1.875 0 0 1-.445 1.035l-2.833 2.833a1.875 1.875 0 0 0 0 2.652l2.833 2.833c.28.28.626.445.994.445s.714-.165.994-.445l2.832-2.833a1.875 1.875 0 0 1 1.036-.445l4.906-.153c.94-.03 1.686-.786 1.686-1.727V9.28c0-.94-.747-1.697-1.686-1.727l-4.906-.153a1.875 1.875 0 0 1-1.036-.445l-2.832-2.833A1.875 1.875 0 0 0 11.078 2.25ZM12.75 9a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" clipRule="evenodd" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" /></svg>;
const ArrowPathIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-4.5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75V4.5a.75.75 0 0 0-1.5 0v2.72a9 9 0 1 0-10.713 9.926.75.75 0 0 0 1.214-.882A7.474 7.474 0 0 1 5.353 10.5H4.755Z" clipRule="evenodd" /></svg>;
const ArrowDownTrayIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" /><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" /></svg>;
const ArrowUpTrayIcon = ({ className = "w-5 h-5 mr-2" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M9.97.97a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L12 4.06l-2.47 2.47a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM12 3a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V3.75A.75.75 0 0 1 12 3Z" /><path d="M3.75 9.75a2.25 2.25 0 0 0-2.25 2.25v6a2.25 2.25 0 0 0 2.25 2.25h16.5a2.25 2.25 0 0 0 2.25-2.25v-6a2.25 2.25 0 0 0-2.25-2.25H3.75Zm16.5 1.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-6a.75.75 0 0 1 .75-.75h16.5Z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" /></svg>;
const ArrowLeftStartOnRectangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.012.626.035.95.023.324.075.72.14 1.062.066.34.152.673.253.97.102.296.223.543.358.745.136.201.287.34.45.425.164.086.342.12.524.12.182 0 .36-.034.524-.12a1.32 1.32 0 0 0 .45-.425c.135-.202.256-.449.357-.745.101-.297.187-.63.253-.97.065-.342.117-.738.14-1.062.023-.324.035-.652.035-.95a1.96 1.96 0 0 0-.189-.866c-.108-.215-.396-.634-.936-.634H9.375Z" clipRule="evenodd" /></svg>;
const InformationCircleIcon = ({ className = "w-6 h-6 mr-2 text-blue-400" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>;
const ExclamationTriangleIcon = ({ className = "w-6 h-6 mr-2 text-yellow-400" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.519 13.007c1.155 2-.772 4.5-3.298 4.5H5.18c-2.526 0-4.453-2.5-3.298-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>;
const BookOpenIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.522c0 .318.218.596.526.684A9.754 9.754 0 0 0 6 21c1.152 0 2.26-.221 3.275-.638a.75.75 0 0 0 .45-.695V5.233a.75.75 0 0 0-.475-.7Z" /><path d="M18.75 4.533A9.707 9.707 0 0 0 13.5 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707V19.28c0 .318.218.596.526.684A9.754 9.754 0 0 0 13.5 21c1.152 0 2.26-.221 3.275-.638a.75.75 0 0 0 .45-.695V5.233a.75.75 0 0 0-.475-.7Z" /></svg>;
const UserCircleIcon = ({ className = "w-5 h-5 mr-1.5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" /></svg>;
const SparklesIcon = ({ className = "w-4 h-4" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 0 0 .44 1.316l4.861 1.214 1.83 4.401c.321.772 1.415.772 1.736 0l1.83-4.401 4.753-.39 3.423-3.11a.75.75 0 0 0-.44-1.316l-4.861-1.214-1.83-4.401Z" clipRule="evenodd" /></svg>;
const LightBulbIcon = ({ className = "w-5 h-5 mr-1" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.25a.75.75 0 0 1 .75.75v2.519c.04.004.079.008.118.012l.001.001.001.001a4.499 4.499 0 0 1 3.02 3.895C16.5 10.5 18 12 18 13.5V15a1.5 1.5 0 0 1-1.5 1.5H7.5A1.5 1.5 0 0 1 6 15v-1.5c0-1.5 1.5-3 2.092-3.824A4.499 4.499 0 0 1 11.13 5.53l.001-.001.001-.001.118-.012V3a.75.75 0 0 1 .75-.75Zm4.525 15.75a.75.75 0 0 0-.75.75 3 3 0 0 1-6 0 .75.75 0 0 0-.75-.75h-.496a.75.75 0 0 0 0 1.5h.496c.21 1.204 1.256 2.142 2.492 2.241A2.252 2.252 0 0 0 12 21.75a2.252 2.252 0 0 0 2.242-.759c1.236-.1 2.281-1.037 2.492-2.241h.496a.75.75 0 0 0 0-1.5h-.496Z" /></svg>;

const ShieldExclamationIcon = ({ className = "w-5 h-5 mr-2" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071 1.071L12.19 4.06 9.93 6.321a.75.75 0 0 0-1.06 1.061l2.261 2.261-3.112 3.112a.75.75 0 0 0 0 1.061l3.536 3.535a.75.75 0 0 0 1.06 0l3.112-3.112 2.261 2.262a.75.75 0 0 0 1.061-1.06l-2.262-2.262 2.714-2.714a.75.75 0 0 0-1.06-1.06l-2.715 2.715-2.26-2.261L14.036 3.357a.75.75 0 0 0-1.071-1.071ZM12 15.75a.75.75 0 0 1 .75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 1 .75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 1 .75.75v.008a2.25 2.25 0 0 1-2.25 2.25h-.008a2.25 2.25 0 0 1-2.25-2.25v-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75-.75v-.008a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>;
const UserGroupIcon = ({ className = "w-5 h-5 mr-2" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M4.5 6.375a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M5.25 7.5A2.25 2.25 0 0 1 3 5.25v-1.5A2.25 2.25 0 0 1 5.25 1.5h13.5A2.25 2.25 0 0 1 21 3.75v1.5A2.25 2.25 0 0 1 18.75 7.5h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75H5.25a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75Zm2.03 4.72a.75.75 0 0 1 1.06 0l.97.97a.75.75 0 1 1-1.06 1.06l-.97-.97a.75.75 0 0 1 0-1.06Zm-2.25 2.25a.75.75 0 0 0 0 1.06l.97.97a.75.75 0 1 0 1.06-1.06l-.97-.97a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" /><path d="M12.75 11.625a.75.75 0 0 0-1.5 0v6.75a.75.75 0 0 0 1.5 0v-6.75Z" /><path d="M14.25 12.375a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M15 13.5A2.25 2.25 0 0 1 12.75 11.25v-1.5A2.25 2.25 0 0 1 15 7.5h3.75A2.25 2.25 0 0 1 21 9.75v1.5A2.25 2.25 0 0 1 18.75 13.5h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75H15a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75Zm-2.03 4.72a.75.75 0 0 1 1.06 0l.97.97a.75.75 0 0 1-1.06 1.06l-.97-.97a.75.75 0 0 1 0-1.06Zm-2.25 2.25a.75.75 0 0 0 0 1.06l.97.97a.75.75 0 1 0 1.06-1.06l-.97-.97a.75.75 0 0 0-1.06 0Z" clipRule="evenodd" /><path d="M5.25 12.375a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Z" /><path fillRule="evenodd" d="M6 13.5A2.25 2.25 0 0 1 3.75 11.25v-1.5A2.25 2.25 0 0 1 6 7.5h3.75A2.25 2.25 0 0 1 12 9.75v1.5A2.25 2.25 0 0 1 9.75 13.5H8.25a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 0-.75-.75H6a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75Z" clipRule="evenodd" /></svg>;
const WrenchScrewdriverIcon = ({ className = "w-5 h-5 mr-2" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 6.75a5.25 5.25 0 0 1 5.25 5.25c0 1.01-.284 1.948-.783 2.734A.75.75 0 0 1 15.9 14.25a.75.75 0 0 1 .321.672l.373 3.731A2.25 2.25 0 0 1 14.348 21H9.652a2.25 2.25 0 0 1-2.246-2.347l.373-3.731a.75.75 0 0 1 .32-.672.75.75 0 0 1-.568-.534A5.232 5.232 0 0 1 6.75 12a5.25 5.25 0 0 1 5.25-5.25Zm0 1.5A3.75 3.75 0 0 0 8.25 12a3.75 3.75 0 0 0 3.75 3.75A3.75 3.75 0 0 0 15.75 12A3.75 3.75 0 0 0 12 8.25Z" clipRule="evenodd" /><path d="M4.002 7.25A.75.75 0 0 1 4.75 6.5h1.016A4.503 4.503 0 0 0 3.3 9.668a.75.75 0 0 1-1.42.498 6.003 6.003 0 0 1 2.453-3.34.75.75 0 0 1-.331-.576V5.5a.75.75 0 0 1 .75-.75H18.5a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.331.576 6.003 6.003 0 0 1 2.453 3.34.75.75 0 1 1-1.42.498A4.503 4.503 0 0 0 18.234 6.5h1.016a.75.75 0 0 1 .75.75v1.505a.75.75 0 0 1-.566.734 4.48 4.48 0 0 0 .001 7.022.75.75 0 0 1 .566.734V18.5a.75.75 0 0 1-.75.75H5.5a.75.75 0 0 1-.75-.75v-.75a.75.75 0 0 1 .566-.734c.09-.023.17-.06.25-.101A4.503 4.503 0 0 0 8.016 12a4.503 4.503 0 0 0-2.451-4.016c-.08-.04-.16-.077-.25-.1A.75.75 0 0 1 4.75 7.25V4.002Z" /></svg>;
const PlusIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>;
const TrashIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.177-2.34.297A1.875 1.875 0 0 0 2.05 6.22l.83 9.126A3.375 3.375 0 0 0 6.199 18.75h7.602a3.375 3.375 0 0 0 3.319-3.398l.83-9.126a1.875 1.875 0 0 0-1.61-1.731c-.76-.12-1.546-.22-2.34-.297V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25V4h-5V3.75Z" clipRule="evenodd" /></svg>;
const BuildingStorefrontIcon = ({ className = "w-5 h-5 mr-2" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Z" /><path d="M6.262 6.072a8.25 8.25 0 0 1 11.477 0 7.5 7.5 0 0 1 0 11.855.75.75 0 0 0 .36.968l1.43 1.072a.75.75 0 0 0 .968-.36 8.25 8.25 0 0 0-11.477 0 .75.75 0 0 0 .968.36l1.43-1.072a.75.75 0 0 0 .36-.968 7.5 7.5 0 0 1 0-11.856Z" /></svg>;
const HandRaisedIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" /></svg>;
const LightningBoltIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" /></svg>;
const SunIcon = ({ className = "w-5 h-5" }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" /></svg>;

// --- HỆ THỐNG ĐA KEY TỰ ĐỘNG ---
const SYSTEM_API_KEYS = [
    // Đã xóa các API Key Gemini cũ theo yêu cầu.
    // Nếu bạn muốn dùng hệ thống nhiều Key OpenRouter, hãy dán các Key của bạn vào đây, cách nhau bởi dấu phẩy.
    "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"
];

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_FALLBACK_API_KEY",
    authDomain: "YOUR_FALLBACK_AUTH_DOMAIN",
    projectId: "YOUR_FALLBACK_PROJECT_ID",
    storageBucket: "YOUR_FALLBACK_STORAGE_BUCKET",
    messagingSenderId: "YOUR_FALLBACK_MESSAGING_SENDER_ID",
    appId: "YOUR_FALLBACK_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ai-text-adventure-simulator-vn';

function parseKeyValueString(kvString) {
    const result = {};
    const pairRegex = /([\w\u00C0-\u017F\s]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w\u00C0-\u017F\s\d.:\/+\-%]+?(?=\s*,\s*[\w\u00C0-\u017F\s]+\s*=|$)))/gu;
    let match;
    while ((match = pairRegex.exec(kvString)) !== null) {
        const key = match[1].trim();
        const value = match[2] || match[3] || match[4];
        if (value !== undefined) {
            const trimmedValue = value.trim();
            result[key] = /^[+-]?\d+(\.\d+)?%?$/.test(trimmedValue) && !isNaN(parseFloat(trimmedValue)) ? (trimmedValue.includes('%') ? trimmedValue : parseFloat(trimmedValue)) : trimmedValue;
        }
    }
    return result;
}

const InitialScreen = (props) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 mb-12 text-center animate-pulse">
            Nhập Vai A.I Simulator
        </h1>
        <div className="space-y-6 w-full max-w-md">
            {props.resumableGameExists && (
                <button
                    onClick={props.handleResumeGame}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-xl focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                >
                    <PlayIcon /> Tiếp Tục Cuộc Phiêu Lưu
                </button>
            )}
            <button
                onClick={() => props.setCurrentScreen('setup')}
                className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-pink-400 focus:ring-opacity-50"
            >
                <PlusCircleIcon /> Bắt Đầu Cuộc Phiêu Lưu Mới
            </button>
            <button
                onClick={props.onLoadFromFileClick}
                className="w-full flex items-center justify-center bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:ring-opacity-50"
            >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" /> Tải Game Từ File
            </button>
            <button
                onClick={() => { props.setShowSettingsModal(true); }}
                className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-lg focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
            >
                <CogIcon /> Cài Đặt
            </button>
        </div>
        <p className={`mt-8 text-sm ${props.apiKeyStatus.color}`}> {props.apiKeyStatus.status}: {props.apiKeyStatus.message} </p>
        {props.userId && <p className="mt-2 text-xs text-gray-400"> UserID: {props.userId} </p>}
    </div>
);

const SettingsModal = ({
    show, onClose,
    inputApiKey, setInputApiKey, apiKeyStatus, saveApiKey, testApiKey,
    isLoading, apiKey, setApiKeyStatus, apiMode, setApiMode,
    setModalMessage, isDevMode, setIsDevMode
}) => {
    if (!show) return null;

    const handleUseSystemKeys = () => {
        setApiMode('systemKeys');
        setInputApiKey('');
        setApiKeyStatus({
            status: 'Đang dùng Hệ Thống Đa Key',
            message: `Hệ thống tự động xoay vòng ${SYSTEM_API_KEYS.length} Key.`,
            color: 'text-sky-400'
        });
        setModalMessage({ show: true, title: "Chế Độ Đa Key Tự Động", content: "Đã chuyển sang sử dụng hệ thống Đa Key. Ngươi không cần cung cấp API Key, hệ thống sẽ tự động xoay vòng khi hết hạn ngạch.", type: "success" });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all border border-purple-700">
                <h2 className="text-3xl font-semibold text-purple-400 mb-6"> Bảng Cài Đặt </h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-sky-400 mb-3"> Chế độ Nhà phát triển </h3>
                        <div className="flex items-center">
                            <input 
                                id="dev-mode-toggle"
                                type="checkbox"
                                checked={isDevMode}
                                onChange={(e) => setIsDevMode(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                            />
                            <label htmlFor="dev-mode-toggle" className="ml-3 block text-sm font-medium text-gray-300">
                                Hiển thị phản hồi gốc từ AI
                            </label>
                        </div>
                    </div>

                    <div className="border-t border-gray-600 pt-4">
                        <h3 className="text-xl font-semibold text-sky-400 mb-3"> Nguồn AI </h3>
                        <button
                            onClick={handleUseSystemKeys}
                            className={`w-full mb-4 flex items-center justify-center font-semibold py-3 px-4 rounded-lg shadow-md transition-colors
                                ${apiMode === 'systemKeys' ? 'bg-sky-600 hover:bg-sky-700 text-white ring-2 ring-sky-400' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
                        >
                            <SparklesIcon className="w-5 h-5 mr-2" /> Sử Dụng Hệ Thống Đa Key Tự Động(Đề xuất)
                        </button>

                        <div className="my-2 text-center text-sm text-gray-400"> Hoặc tự dùng Key riêng </div>

                        <div>
                            <label htmlFor="apiKeyInputModal" className={`block text-sm font-medium mb-1 ${apiMode === 'userKey' ? 'text-gray-300' : 'text-gray-500'}`}>
                                Sử Dụng API Key Gemini Của Ngươi:
                            </label>
                            <input
                                type="password"
                                id="apiKeyInputModal"
                                name="apiKeyInputModalName"
                                autoComplete="new-password"
                                value={inputApiKey}
                                onChange={(e) => {
                                    setInputApiKey(e.target.value);
                                    if (apiMode !== 'userKey' && e.target.value.trim() !== '') {
                                        setApiMode('userKey');
                                        setApiKeyStatus({ status: 'Chưa cấu hình', message: 'Nhập API Key của bạn.', color: 'text-yellow-500' });
                                    }
                                }}
                                placeholder="Nhập API Key của ngươi tại đây"
                                className={`w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500 ${apiMode !== 'userKey' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={apiMode !== 'userKey'}
                            />
                        </div>

                        {apiMode === 'userKey' && (
                            <>
                                <div className={`my-3 text-sm ${apiKeyStatus.color}`}> {apiKeyStatus.status}: {apiKeyStatus.message} </div>
                                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-3">
                                    <button
                                        onClick={saveApiKey}
                                        disabled={isLoading || !inputApiKey}
                                        className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors disabled:bg-gray-500"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> {isLoading ? 'Đang lưu...' : 'Lưu API Key'}
                                    </button>
                                    <button
                                        onClick={testApiKey}
                                        disabled={isLoading || !inputApiKey}
                                        className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors disabled:bg-gray-500"
                                    >
                                        <CheckIcon /> {isLoading ? 'Đang kiểm tra...' : 'Kiểm Tra API'}
                                    </button>
                                </div>
                            </>
                        )}
                        {apiMode === 'systemKeys' && (
                            <div className="my-3 text-sm text-sky-400"> Đang sử dụng hệ thống danh sách Key tự động dự phòng. Không cần lưu hay kiểm tra API Key thủ công.</div>
                        )}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

const GameSetupScreen = ({
    goHome, gameSettings, handleInputChange, initializeGame, isLoading, apiKey,
    handleFetchSuggestions, isFetchingSuggestions,
    handleGenerateBackstory, isGeneratingContent, apiMode, handleGenerateDifficultyDescription, isGeneratingDifficultyDesc,
    handleGeneratePromptSetting, isGeneratingPromptSetting,
    addInitialWorldElement, removeInitialWorldElement, handleInitialElementChange, handleGenerateInitialElementDescription,
    isGeneratingInitialElementDesc, setShowSettingsModal
}) => (
    <div className="min-h-screen bg-gray-800 text-white p-4 md:p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-gray-700 p-6 md:p-8 rounded-xl shadow-2xl relative">
            <button onClick={goHome} className="absolute top-4 left-4 text-purple-400 hover:text-purple-300 text-sm flex items-center bg-gray-600 hover:bg-gray-500 p-2 rounded-lg shadow transition-colors">
                <ArrowLeftStartOnRectangleIcon /> Về Trang Chủ
            </button>
            <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-8 text-center pt-10 sm:pt-0"> Kiến Tạo Thế Giới Của Ngươi </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                <div className="space-y-6">
                    <fieldset className="border border-gray-600 p-4 rounded-lg">
                        <legend className="text-xl font-semibold text-pink-400 px-2"> Bối Cảnh Truyện </legend>
                        <div className="mt-2 space-y-4">
                            <div>
                                <label htmlFor="theme" className="block text-lg font-medium text-gray-300 mb-1"> Chủ Đề: </label>
                                <div className="flex items-center gap-2">
                                    <input type="text" name="theme" id="theme" value={gameSettings.theme} onChange={handleInputChange} placeholder="VD: Tiên hiệp, Huyền huyễn, Đô thị dị năng, Trinh thám, Kinh dị..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-pink-500 focus:border-pink-500" />
                                    <button onClick={() => handleFetchSuggestions('theme')} disabled={isFetchingSuggestions || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-pink-600 hover:bg-pink-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Chủ đề">
                                        {isFetchingSuggestions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5 text-white" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="setting" className="block text-lg font-medium text-gray-300 mb-1"> Thế Giới / Bối Cảnh Chi Tiết: </label>
                                <div className="flex items-center gap-2">
                                    <input type="text" name="setting" id="setting" value={gameSettings.setting} onChange={handleInputChange} placeholder="VD: Đại Lục Phong Vân, Tinh Không Vô Tận..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-pink-500 focus:border-pink-500" />
                                    <button onClick={() => handleFetchSuggestions('setting')} disabled={isFetchingSuggestions || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-pink-600 hover:bg-pink-700 rounded-lg disabled:bg-gray-500" title="✨ Gợi ý Bối cảnh">
                                        {isFetchingSuggestions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5 text-white" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="border border-gray-600 p-4 rounded-lg">
                        <legend className="text-xl font-semibold text-teal-400 px-2"> Độ Khó & Nội Dung </legend>
                        <div className="mt-2 space-y-4">
                            <div>
                                <label htmlFor="difficulty" className="block text-lg font-medium text-gray-300 mb-1"> Chọn Độ Khó: </label>
                                <select name="difficulty" id="difficulty" value={gameSettings.difficulty} onChange={handleInputChange} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-teal-500 focus:border-teal-500">
                                    <option value="Dễ"> Dễ - Dành cho người mới, ít thử thách </option>
                                    <option value="Thường"> Thường - Cân bằng, phù hợp đa số </option>
                                    <option value="Khó"> Khó - Thử thách cao, cần tính toán </option>
                                    <option value="Ác Mộng"> Ác Mộng - Cực kỳ khó, không khoan nhượng </option>
                                    <option value="Tuỳ Chỉnh AI"> Tuỳ Chỉnh AI - Để AI mô tả độ khó </option>
                                </select>
                            </div>
                            {(gameSettings.difficulty === "Tuỳ Chỉnh AI" || gameSettings.difficultyDescription) && (
                                <div>
                                    <label htmlFor="difficultyDescription" className="block text-lg font-medium text-gray-300 mb-1"> Mô Tả Độ Khó(AI hoặc Tự Điền): </label>
                                    <div className="flex items-center gap-2">
                                        <textarea name="difficultyDescription" id="difficultyDescription" value={gameSettings.difficultyDescription} onChange={handleInputChange} rows="2" placeholder="AI sẽ mô tả độ khó ở đây..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-teal-500 focus:border-teal-500" />
                                        {gameSettings.difficulty === "Tuỳ Chỉnh AI" && (
                                            <button onClick={handleGenerateDifficultyDescription} disabled={isGeneratingDifficultyDesc || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-teal-600 hover:bg-teal-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Tạo Mô Tả Độ Khó">
                                                {isGeneratingDifficultyDesc ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5 text-white" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center mt-3">
                                <input type="checkbox" name="allowNsfw" id="allowNsfw" checked={gameSettings.allowNsfw} onChange={handleInputChange} className="h-5 w-5 text-red-500 bg-gray-600 border-gray-500 rounded focus:ring-red-600 focus:ring-offset-gray-800" />
                                <label htmlFor="allowNsfw" className="ml-2 text-sm font-medium text-gray-300"> Cho phép nội dung NSFW(18 +) </label>
                            </div>
                            <p className="text-xs text-gray-400 italic"> Khi tick chọn, AI có thể tạo nội dung khiêu dâm, bạo lực, kinh dị cực đoan.</p>

                            <div className="flex items-center mt-3 border-t border-gray-600 pt-3">
                                <input 
                                    type="checkbox"
                                    name="peacefulMode"
                                    id="peacefulMode"
                                    checked={gameSettings.peacefulMode}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-600 focus:ring-offset-gray-800"
                                />
                                <label htmlFor="peacefulMode" className="ml-2 text-sm font-medium text-green-300 flex items-center">
                                    <SunIcon className="w-4 h-4 mr-1" /> Chế Độ Yên Bình(Không Drama)
                                </label>
                            </div>
                            <p className="text-xs text-gray-400 italic"> Chế độ này loại bỏ hoàn toàn các kẻ phản diện, tai họa bất ngờ hay drama. Chỉ tập trung vào cuộc sống vui vẻ, nhẹ nhàng.</p>

                        </div>
                    </fieldset>
                </div>

                <div className="space-y-6">
                    <fieldset className="border border-gray-600 p-4 rounded-lg">
                        <legend className="text-xl font-semibold text-sky-400 px-2"> Nhân Vật Chính </legend>
                        <div className="mt-2 space-y-4">
                            <div>
                                <label htmlFor="characterName" className="block text-lg font-medium text-gray-300 mb-1"> Danh Xưng / Tên Nhân Vật: </label>
                                <input type="text" name="characterName" id="characterName" value={gameSettings.characterName} onChange={handleInputChange} placeholder="VD: Diệp Phàm, Hàn Lập, Lâm Động..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500" />
                            </div>
                            <div>
                                <label htmlFor="characterGender" className="block text-lg font-medium text-gray-300 mb-1"> Giới Tính: </label>
                                <select name="characterGender" id="characterGender" value={gameSettings.characterGender} onChange={handleInputChange} className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500">
                                    <option value="Không xác định"> Không xác định / Để AI quyết định </option>
                                    <option value="Nam"> Nam </option>
                                    <option value="Nữ"> Nữ </option>
                                    <option value="Khác"> Khác </option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="initialRealmInputMode" className="block text-lg font-medium text-gray-300 mb-1"> Tu Vi / Cảnh Giới Ban Đầu: </label>
                                <div className="flex flex-col gap-2">
                                    <select 
                                        name="initialRealmInputMode"
                                        id="initialRealmInputMode"
                                        value={gameSettings.initialRealmInputMode}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                        }}
                                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500"
                                    >
                                        <option value="system"> Hệ thống mặc định(Theo chủ đề / Level 1) </option>
                                        <option value="random"> Ngẫu Nhiên(AI Quyết Định) </option>
                                        <option value="custom"> Tự Chọn(Nhập thủ công) </option>
                                    </select>
                                    {gameSettings.initialRealmInputMode === 'custom' && (
                                        <input 
                                            type="text"
                                            name="initialRealm"
                                            value={gameSettings.initialRealm}
                                            onChange={handleInputChange}
                                            placeholder="Nhập cảnh giới mong muốn (VD: Đại Thừa Kỳ, Đấu Đế...)"
                                            className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500 animate-fadeIn"
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="characterBackstory" className="block text-lg font-medium text-gray-300 mb-1"> Sơ Lược Tiểu Sử / Đặc Điểm(2 - 3 câu): </label>
                                <div className="flex items-center gap-2">
                                    <textarea name="characterBackstory" id="characterBackstory" value={gameSettings.characterBackstory} onChange={handleInputChange} rows="4" placeholder="VD: Một phế vật mang trong mình huyết mạch thượng cổ, một thiếu nữ tài năng bị vị hôn phu từ hôn..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-sky-500 focus:border-sky-500"></textarea>
                                    <button onClick={handleGenerateBackstory} disabled={isGeneratingContent || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-sky-600 hover:bg-sky-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ Tạo Tiểu sử">
                                        {isGeneratingContent ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5 text-white" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>

            <fieldset className="border-2 border-lime-600 p-4 rounded-lg mb-6 bg-gray-700/30">
                <legend className="text-xl font-semibold text-lime-300 px-2 flex items-center">
                    <BuildingStorefrontIcon className="text-lime-400" /> Kiến Tạo Thế Giới Ban Đầu(Tùy chọn)
                </legend>
                <div className="mt-3 space-y-4">
                    {gameSettings.initialWorldElements.map((element, index) => (
                        <div key={element.id} className="p-3 bg-gray-600/50 rounded-lg border border-gray-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
                                <div>
                                    <label htmlFor={`elementName-${index}`} className="block text-sm font-medium text-gray-300 mb-1"> Tên Thực Thể: </label>
                                    <input
                                        type="text"
                                        id={`elementName-${index}`}
                                        name="name"
                                        value={element.name}
                                        onChange={(e) => handleInitialElementChange(index, e)}
                                        placeholder="VD: Lão Ma Đầu, Hắc Ám Sâm Lâm,..."
                                        className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`elementType-${index}`} className="block text-sm font-medium text-gray-300 mb-1"> Loại Thực Thể: </label>
                                    <select
                                        id={`elementType-${index}`}
                                        name="type"
                                        value={element.type}
                                        onChange={(e) => handleInitialElementChange(index, e)}
                                        className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm"
                                    >
                                        <option value="NPC"> Nhân Vật(NPC) </option>
                                        <option value="LOCATION"> Địa Điểm </option>
                                        <option value="ITEM"> Vật Phẩm </option>
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <label htmlFor={`elementDesc-${index}`} className="block text-sm font-medium text-gray-300 mb-1"> Mô Tả Thực Thể: </label>
                                    <div className="flex items-start gap-2">
                                        <textarea 
                                            id={`elementDesc-${index}`}
                                            name="description"
                                            value={element.description}
                                            onChange={(e) => handleInitialElementChange(index, e)}
                                            rows="2"
                                            placeholder="Mô tả chi tiết về thực thể này..."
                                            className="w-full p-2 bg-gray-500 border border-gray-400 rounded-md focus:ring-lime-500 focus:border-lime-500 text-sm"
                                        />
                                        <button 
                                            onClick={() => handleGenerateInitialElementDescription(index)}
                                            disabled={isGeneratingInitialElementDesc[element.id] || !element.name || (apiMode === 'userKey' && !apiKey)}
                                            className="p-2.5 bg-lime-600 hover:bg-lime-700 rounded-md disabled:bg-gray-500 self-center"
                                            title="✨ AI Tạo Mô Tả Thực Thể"
                                        >
                                            {isGeneratingInitialElementDesc[element.id] ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4 text-white" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeInitialWorldElement(element.id)}
                                className="mt-1 text-xs bg-red-700 hover:bg-red-800 text-white py-1 px-2 rounded-md flex items-center"
                            >
                                <TrashIcon className="w-3 h-3 mr-1" /> Xóa Thực Thể Này
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={addInitialWorldElement}
                        className="w-full mt-2 py-2 px-4 bg-lime-700 hover:bg-lime-800 text-white font-semibold rounded-lg shadow-md flex items-center justify-center text-sm"
                    >
                        <PlusIcon className="mr-1" /> Thêm Thực Thể Ban Đầu
                    </button>
                </div>
            </fieldset>

            <fieldset className="border-2 border-purple-600 p-4 rounded-lg mb-6 bg-gray-700/30">
                <legend className="text-xl font-semibold text-purple-300 px-2 flex items-center"> <WrenchScrewdriverIcon className="text-purple-400" /> Thiết Lập Prompt Nâng Cao </legend>
                <div className="mt-3 grid grid-cols-1 gap-y-5">
                    <div>
                        <label htmlFor="writingStyle" className="block text-lg font-medium text-gray-300 mb-1"> Phong Cách Viết: </label>
                        <div className="flex items-center gap-2">
                            <textarea name="writingStyle" id="writingStyle" value={gameSettings.writingStyle} onChange={handleInputChange} rows="2" placeholder="VD: Hài hước đen tối, Sử thi bi tráng, Lãng mạn cổ điển, Kinh dị tâm lý..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                            <button onClick={() => handleGeneratePromptSetting('writingStyle')} disabled={isGeneratingPromptSetting.writingStyle || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Gợi Ý Phong Cách Viết">
                                {isGeneratingPromptSetting.writingStyle ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"> </div> : <SparklesIcon className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="specialPlotElements" className="block text-lg font-medium text-gray-300 mb-1"> Yếu Tố Cốt Truyện Đặc Biệt: </label>
                        <div className="flex items-center gap-2">
                            <textarea name="specialPlotElements" id="specialPlotElements" value={gameSettings.specialPlotElements} onChange={handleInputChange} rows="2" placeholder="VD: Tập trung vào giải đố logic, Nhiều plot twist bất ngờ, Ít yếu tố chiến đấu, Xây dựng căn cứ/thế lực..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                            <button onClick={() => handleGeneratePromptSetting('specialPlotElements')} disabled={isGeneratingPromptSetting.specialPlotElements || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Gợi Ý Yếu Tố Cốt Truyện">
                                {isGeneratingPromptSetting.specialPlotElements ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"> </div> : <SparklesIcon className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="otherAiInstructions" className="block text-lg font-medium text-gray-300 mb-1"> Hướng Dẫn AI Chung Khác: </label>
                        <div className="flex items-center gap-2">
                            <textarea name="otherAiInstructions" id="otherAiInstructions" value={gameSettings.otherAiInstructions} onChange={handleInputChange} rows="3" placeholder="VD: Tránh các tình huống lãng mạn sến súa, Tăng cường yếu tố sinh tồn, Nhân vật phụ có chiều sâu và mục tiêu riêng..." className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                            <button onClick={() => handleGeneratePromptSetting('otherAiInstructions')} disabled={isGeneratingPromptSetting.otherAiInstructions || (apiMode === 'userKey' && !apiKey)} className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:bg-gray-500 self-start" title="✨ AI Gợi Ý Hướng Dẫn Chung">
                                {isGeneratingPromptSetting.otherAiInstructions ? <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"> </div> : <SparklesIcon className="w-5 h-5 text-white" />}
                            </button>
                        </div>
                    </div>
                </div>
            </fieldset>

            <button
                onClick={initializeGame}
                disabled={isLoading || (apiMode === 'userKey' && !apiKey)}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-xl disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
                <PlusCircleIcon /> {isLoading ? 'Đang Khởi Tạo Thế Giới...' : ((apiMode === 'userKey' && !apiKey) ? 'Cần API Key Để Bắt Đầu' : 'Khởi Tạo Thế Giới')}
            </button>
            {(apiMode === 'userKey' && !apiKey) && <p className="text-yellow-400 text-sm mt-3 text-center"> Vui lòng <button onClick={() => { setShowSettingsModal(true); }} className="underline hover:text-yellow-300 font-semibold"> thiết lập API Key </button> của ngươi trước khi bắt đầu.</p>}
        </div>
    </div>
);

const LoreModal = ({ knowledge, show, onClose }) => {
    if (!show) return null;
    const renderSection = (title, items, icon = null, itemColor = "text-green-300") => {
        if (!items || items.length === 0) return null;
        return (
            <div className="mb-4">
                <h4 className={`text-lg font-semibold ${itemColor} mb-2 flex items-center`}> {icon && <span className="mr-1.5"> {icon} </span>}{title}</h4>
                <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
                    {items.map((item, index) => (
                        <li key={index} className="text-gray-300">
                            <strong className={itemColor}> {item.Name || "Không rõ tên"}: </strong> {item.Description || "Chưa có mô tả."}
                            {(item.SứcMạnh || item.Stats) && <span className="text-xs text-gray-400 ml-2"> (Sức mạnh: {item.SứcMạnh || item.Stats}) </span>}
                            {item.Duration && <span className="text-xs text-gray-400 ml-2"> ({item.Duration}) </span>}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col border border-purple-600">
                <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center"> <BookOpenIcon /> Sổ Tay Kiến Thức</h3>
                <div className="overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
                    {renderSection("Nhân Vật Đã Gặp (NPCs)", knowledge.npcs, <UserCircleIcon />, "text-sky-400")}
                    {renderSection("Vật Phẩm Quan Trọng", knowledge.items, <SparklesIcon className="w-5 h-5 text-yellow-400" />, "text-yellow-400")}
                    {renderSection("Địa Điểm Đã Khám Phá", knowledge.locations, <InformationCircleIcon className="w-5 h-5 text-blue-400" />, "text-blue-400")}
                    {renderSection("Đồng Hành", knowledge.companions, <UserGroupIcon className="text-lime-400" />, "text-lime-400")}
                    {renderSection("Hiệu Ứng Trạng Thái", knowledge.statusEffects, <ShieldExclamationIcon className="text-orange-400" />, "text-orange-400")}

                    {(!knowledge.npcs || knowledge.npcs.length === 0) &&
                        (!knowledge.items || knowledge.items.length === 0) &&
                        (!knowledge.locations || knowledge.locations.length === 0) &&
                        (!knowledge.companions || knowledge.companions.length === 0) &&
                        (!knowledge.statusEffects || knowledge.statusEffects.length === 0) && (
                            <p className="text-gray-400 italic text-center py-4"> Chưa có thông tin nào được ghi lại trong sổ tay của ngươi.</p>
                        )}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                    Đóng Sổ Tay
                </button>
            </div>
        </div>
    );
};

const QuickLoreModal = ({ loreItem, show, onClose }) => {
    if (!show || !loreItem) return null;
    let icon = <InformationCircleIcon className="w-5 h-5 mr-2 text-cyan-400 mt-1" />;
    if (loreItem.category === 'npcs') icon = <UserCircleIcon className="w-5 h-5 mr-2 text-sky-400 mt-1" />;
    else if (loreItem.category === 'items') icon = <SparklesIcon className="w-5 h-5 mr-2 text-yellow-400 mt-1" />;
    else if (loreItem.category === 'companions') icon = <UserGroupIcon className="w-5 h-5 mr-2 text-lime-400 mt-1" />;
    else if (loreItem.category === 'statusEffects') icon = <ShieldExclamationIcon className="w-5 h-5 mr-2 text-orange-400 mt-1" />;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[80]" onClick={onClose}>
            <div className="bg-gray-700 p-5 rounded-lg shadow-xl w-full max-w-sm border border-cyan-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start mb-2">
                    {icon}
                    <h4 className="text-lg font-semibold text-cyan-300"> {loreItem.Name} </h4>
                </div>
                <p className="text-sm text-gray-200 bg-gray-600 p-3 rounded max-h-40 overflow-y-auto whitespace-pre-line scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-600">
                    {loreItem.Description || "Không có mô tả chi tiết."}
                </p>
                {(loreItem.SứcMạnh || loreItem.Stats) && <p className="text-xs text-gray-300 mt-1"> <strong>Sức mạnh: </strong> {loreItem.SứcMạnh || loreItem.Stats}</p>}
                {loreItem.Duration && <p className="text-xs text-gray-300 mt-1"> <strong>Thời gian: </strong> {loreItem.Duration}</p>}
                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-md text-sm"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

const CharacterStatsPanel = ({ stats }) => {
    const StatItem = ({ label, value, className = '' }) => (
        <div className={`flex justify-between items-center text-sm ${className}`}>
            <span className="text-gray-400"> {label}: </span>
            <span className="text-gray-100 font-semibold"> {value} </span>
        </div>
    );

    const ProgressBar = ({ value, maxValue, colorClass, label }) => (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className={`font-semibold ${colorClass.replace('bg-', 'text-').replace('-500', '-300')}`}> {label} </span>
                <span> {value} / {maxValue} </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2.5">
                <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${Math.max(0, Math.min(100, (value / maxValue) * 100))}%` }}> </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-800/80 p-3 rounded-xl shadow-2xl border border-gray-700 flex flex-col h-full">
            <div className="flex items-center justify-center p-2 mb-2 bg-gray-700 text-purple-300 font-semibold rounded-t-lg border-b border-gray-600">
                <UserCircleIcon />
                <span className="ml-1"> Thông Tin Nhân Vật </span>
            </div>

            <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700 pr-2">
                <div className="space-y-3">
                    <h3 className="text-center font-bold text-lg text-purple-300"> {stats.name} </h3>
                    <StatItem label="Cảnh Giới" value={stats.realm} className="text-base" />
                    <StatItem label="Thọ Nguyên" value={`${stats.lifespan} / ${stats.maxLifespan}`} />
                    <StatItem label="Công Pháp" value={stats.cultivationMethod} />

                    <ProgressBar value={stats.health} maxValue={stats.maxHealth} colorClass="bg-red-500" label="HP" />

                    <div className="pt-2">
                        <ProgressBar value={stats.experience} maxValue={stats.nextLevelExp} colorClass="bg-yellow-500" label="Tu Vi" />
                    </div>

                    <div className="border-t border-gray-600 my-2"> </div>

                    <StatItem label="Căn Cốt" value={stats.innateTalent} />
                    <StatItem label="Thể Chất" value={stats.physique} />
                    <StatItem label="May Mắn" value={stats.luck} />
                    <StatItem label="Sức Mạnh" value={stats.combatPower} />
                    <StatItem label="Sát Khí" value={stats.demonicQi} />
                    <StatItem label="Tính Cách" value={stats.personality} />
                </div>
            </div>
        </div>
    );
};

const GameplayScreen = ({
    goHome, gameSettings, restartGame, storyHistory, isLoading,
    choices, handleChoice, formatStoryText, customActionInput, setCustomActionInput,
    handleCustomAction, setShowLoreModal, handleFetchStorySummary, isFetchingSummary,
    isProcessingAction,
    characterStats, handleManualSave, chatHistoryForGemini, isDevMode,
    isGodMode, setIsGodMode
}) => {
    const lastAIResponse = isDevMode ? chatHistoryForGemini.filter(m => m.role === 'model').pop()?.parts[0].text : null;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row p-2 md:p-4 gap-4 h-screen">
            {/* Left Panel: Character Stats */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 md:h-[calc(100vh-2rem)]">
                <CharacterStatsPanel stats={characterStats} />
            </div>

            {/* Right Panel: Story and Actions */}
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-2 p-2 bg-gray-800/50 rounded-lg shadow-md flex-shrink-0">
                    <button onClick={goHome} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-colors flex items-center self-start sm:self-center text-sm">
                        <ArrowLeftStartOnRectangleIcon /> Về Trang Chủ
                    </button>
                    <h1 className="text-lg md:text-xl font-bold text-purple-300 text-center flex-1 mx-2 truncate order-first sm:order-none" title={gameSettings.theme || "Cuộc Phiêu Lưu"}>
                        {gameSettings.theme || "Cuộc Phiêu Lưu"}
                    </h1>
                    <div className="flex gap-1.5 self-end sm:self-center flex-wrap justify-end">
                        <button onClick={handleManualSave} disabled={isProcessingAction} className="bg-green-600 hover:bg-green-700 text-white font-semibold p-2 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500" title="Lưu Game Về Máy">
                            <ArrowDownTrayIcon />
                        </button>
                        <button onClick={handleFetchStorySummary} disabled={isFetchingSummary || isLoading || isProcessingAction} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold p-2 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500" title="✨ Tóm tắt câu chuyện">
                            {isFetchingSummary ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon />}
                        </button>
                        <button onClick={() => setShowLoreModal(true)} disabled={isLoading || isProcessingAction} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold p-2 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500" title="Sổ tay">
                            <BookOpenIcon className="w-4 h-4" />
                        </button>
                        <button onClick={restartGame} disabled={isLoading || isProcessingAction} className="bg-red-600 hover:bg-red-700 text-white font-semibold p-2 rounded-lg shadow-md transition-colors flex items-center text-xs disabled:bg-gray-500" title="Bắt đầu lại">
                            <ArrowPathIcon />
                        </button>
                    </div>
                </header>

                <div className="flex-grow bg-gray-800 p-3 md:p-5 rounded-xl shadow-2xl overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700" id="story-content-area">
                    {storyHistory.map((item, index) => (
                        <div key={index} className={`story-item mb-3 p-3 rounded-lg shadow-sm
                            ${item.type === 'story' ? 'bg-gray-700/80' :
                                item.type === 'user_choice' ? 'bg-blue-900/70 text-blue-200 ring-1 ring-blue-700' :
                                    item.type === 'user_custom_action' ? 'bg-indigo-900/70 text-indigo-200 ring-1 ring-indigo-700' :
                                        item.type === 'god_action' ? 'bg-red-900/60 text-red-200 ring-1 ring-red-700 border-l-4 border-red-500' :
                                            'bg-yellow-800/70 text-yellow-200 ring-1 ring-yellow-700'}`}>
                            {item.type === 'user_choice' && <p className="font-semibold text-blue-300"> Ngươi đã chọn: </p>}
                            {item.type === 'user_custom_action' && <p className="font-semibold text-indigo-300"> Hành động của ngươi: </p>}
                            {item.type === 'god_action' && <p className="font-bold text-red-400 flex items-center"> <LightningBoltIcon className="mr-1" /> CAN THIỆP CỐT TRUYỆN: </p>}
                            {item.type === 'system' && <p className="font-semibold text-yellow-300"> Thông báo hệ thống: </p>}
                            <div className="prose prose-sm prose-invert max-w-none text-gray-200"> {formatStoryText(item.content)} </div>
                        </div>
                    ))}
                    {(isLoading || isProcessingAction) && (
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"> </div>
                            <p className="mt-3 text-purple-300"> AI đang viết tiếp câu chuyện...</p>
                        </div>
                    )}
                </div>

                {isDevMode && lastAIResponse && (
                    <div className="flex-shrink-0 bg-gray-900/50 border border-yellow-500 rounded-lg p-3 mb-3">
                        <h3 className="text-sm font-semibold text-yellow-400 mb-2"> Phản Hồi Gốc Từ AI(Dev Mode) </h3>
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-32 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-gray-800"> {lastAIResponse} </pre>
                    </div>
                )}

                {!(isLoading || isProcessingAction) && (
                    <div className="bg-gray-800 p-3 rounded-xl shadow-xl mt-auto flex-shrink-0">
                        {choices.length > 0 && (
                            <>
                                <h3 className="text-sm font-semibold text-green-400 mb-2"> Lựa chọn của ngươi: </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    {choices.map((choice, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleChoice(choice)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all text-left text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                                        >
                                            {index + 1}. {choice}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        <div>
                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={() => setIsGodMode(!isGodMode)}
                                    className={`p-2 rounded-lg shadow-md transition-colors ${isGodMode ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-400'}`}
                                    title={isGodMode ? "Đang bật chế độ Can Thiệp (God Mode)" : "Bật chế độ Can Thiệp (God Mode)"}
                                >
                                    {isGodMode ? <LightningBoltIcon /> : <HandRaisedIcon />}
                                </button>
                                <input
                                    type="text"
                                    id="customActionInput"
                                    value={customActionInput}
                                    onChange={(e) => setCustomActionInput(e.target.value)}
                                    placeholder={isGodMode ? "Nhập sự kiện muốn xảy ra (VD: Xóa nhân vật này...)" : "Nhập hành động của nhân vật..."}
                                    className={`flex-grow p-2 bg-gray-700 border rounded-lg text-white focus:ring-2 text-sm ${isGodMode ? 'border-red-500 focus:ring-red-500 placeholder-red-300' : 'border-gray-600 focus:ring-purple-500'}`}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCustomAction(customActionInput, isGodMode)}
                                />
                                <button
                                    onClick={() => handleCustomAction(customActionInput, isGodMode)}
                                    className={`${isGodMode ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-colors text-sm`}
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MessageModal = ({ show, title, content, type, onClose }) => {
    if (!show) return null;
    let titleColor = 'text-blue-400';
    let IconComponent = InformationCircleIcon;
    if (type === 'error') {
        titleColor = 'text-red-400';
        IconComponent = () => <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-red-400" />;
    } else if (type === 'success') {
        titleColor = 'text-green-400';
        IconComponent = CheckIcon;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="flex items-center mb-4">
                    <IconComponent />
                    <h3 className={`text-xl font-semibold ${titleColor}`}>{title}</h3>
                </div>
                <p className="text-gray-300 mb-6 whitespace-pre-line">{content}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all"
                >
                    Đã hiểu
                </button>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ show, title, content, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy", setConfirmationModal: localSetConfirmationModal }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-yellow-700">
                <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon />
                    <h3 className="text-xl font-semibold text-yellow-400">{title}</h3>
                </div>
                <p className="text-gray-300 mb-6 whitespace-pre-line">{content}</p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                        onClick={() => { onConfirm(); localSetConfirmationModal(prev => ({ ...prev, show: false })); }}
                        className={`flex-1 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all ${confirmText.toLowerCase().includes("xóa") || confirmText.toLowerCase().includes("delete") ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={() => { if (onCancel) onCancel(); localSetConfirmationModal(prev => ({ ...prev, show: false })); }}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow hover:shadow-md transition-all"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuggestionsModal = ({ show, title, suggestions, onSelect, onClose, isLoading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[70]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-pink-700">
                <h3 className="text-xl font-semibold text-pink-400 mb-4 flex items-center">
                    <LightBulbIcon /> {title}
                </h3>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="w-8 h-8 border-4 border-t-transparent border-pink-400 rounded-full animate-spin"></div>
                        <p className="ml-3 text-gray-300"> Đang tải gợi ý từ Đại Năng...</p>
                    </div>
                ) : suggestions.length > 0 ? (
                    <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-700">
                        {suggestions.map((suggestion, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => { onSelect(suggestion); onClose(); }}
                                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600/80 rounded-md text-gray-200 transition-colors shadow hover:shadow-md"
                                >
                                    {suggestion}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-center py-4"> Không có gợi ý nào được tạo ra.Hãy thử lại hoặc tự sáng tạo! </p>
                )}
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
}

const SummaryModal = ({ show, title, summaryText, onClose, isLoading }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[70]">
            <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-cyan-700">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">{title}</h3>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="w-8 h-8 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
                        <p className="ml-3 text-gray-300">✨ AI đang tóm tắt diễn biến...</p>
                    </div>
                ) : (
                    <div className="text-gray-300 whitespace-pre-line bg-gray-700 p-4 rounded-md max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-gray-700">
                        {summaryText || "Chưa có tóm tắt nào được tạo."}
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

const App = () => {
    const [currentScreen, setCurrentScreen] = useState('initial');
    const [apiKey, setApiKey] = useState('');
    const [apiMode, setApiMode] = useState('systemKeys');

    const systemKeyIndexRef = useRef(0); // Dùng useRef quản lý chỉ mục vòng lặp (Round Robin)

    const [apiKeyStatus, setApiKeyStatus] = useState({
        status: 'Đang dùng Hệ Thống Đa Key',
        message: `Hệ thống tự động xoay vòng ${SYSTEM_API_KEYS.length} Key.`,
        color: 'text-sky-400'
    });
    const [gameSettings, setGameSettings] = useState({
        theme: '',
        setting: '',
        characterName: '',
        characterGender: 'Không xác định',
        characterBackstory: '',
        difficulty: 'Thường',
        difficultyDescription: '',
        allowNsfw: false,
        peacefulMode: false,
        writingStyle: '',
        specialPlotElements: '',
        otherAiInstructions: '',
        initialWorldElements: [],
        initialRealmInputMode: 'system',
        initialRealm: '',
    });
    const [storyHistory, setStoryHistory] = useState([]);
    const [choices, setChoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [inputApiKey, setInputApiKey] = useState('');
    const [chatHistoryForGemini, setChatHistoryForGemini] = useState([]);
    const [modalMessage, setModalMessage] = useState({ show: false, title: '', content: '', type: 'info' });
    const [confirmationModal, setConfirmationModal] = useState({ show: false, title: '', content: '', onConfirm: null, onCancel: null, confirmText: 'Xác nhận', cancelText: 'Hủy' });

    const [customActionInput, setCustomActionInput] = useState('');
    const [knowledgeBase, setKnowledgeBase] = useState({ npcs: [], items: [], locations: [], companions: [], statusEffects: [] });
    // Bộ nhớ dài hạn
    const [gameMemory, setGameMemory] = useState([]);
    const [showLoreModal, setShowLoreModal] = useState(false);

    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [showSuggestionsModal, setShowSuggestionsModal] = useState({ show: false, fieldType: null, suggestions: [] });
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isGeneratingDifficultyDesc, setIsGeneratingDifficultyDesc] = useState(false);
    const [isGeneratingPromptSetting, setIsGeneratingPromptSetting] = useState({
        writingStyle: false,
        specialPlotElements: false,
        otherAiInstructions: false,
    });
    const [isGeneratingInitialElementDesc, setIsGeneratingInitialElementDesc] = useState({});

    const [storySummary, setStorySummary] = useState('');
    const [isFetchingSummary, setIsFetchingSummary] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);

    const [showQuickLoreModal, setShowQuickLoreModal] = useState(false);
    const [quickLoreContent, setQuickLoreContent] = useState(null);

    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [resumableGameExists, setResumableGameExists] = useState(false);
    const fileInputRef = useRef(null);
    const [isDevMode, setIsDevMode] = useState(false);

    const [isGodMode, setIsGodMode] = useState(false);

    const [characterStats, setCharacterStats] = useState({
        name: 'Vô Danh',
        age: 16,
        lifespan: 16,
        maxLifespan: 80,
        cultivationMethod: 'Chưa có',
        demonicQi: 0,
        realm: 'Phàm Nhân',
        health: 100,
        maxHealth: 100,
        cultivation: 0,
        experience: 0,
        nextLevelExp: 100,
        innateTalent: 'Bình thường',
        physique: 10,
        luck: 5,
        combatPower: 20,
        personality: 'Chưa xác định'
    });

    const openQuickLoreModal = useCallback((category, name) => {
        let item = null;
        const categoryKey = category.toLowerCase();
        if (knowledgeBase && knowledgeBase[categoryKey]) {
            item = knowledgeBase[categoryKey].find(i => i.Name && i.Name.trim().toLowerCase() === name.trim().toLowerCase());
        }
        if (item) {
            setQuickLoreContent({ ...item, category: categoryKey });
            setShowQuickLoreModal(true);
        } else {
            console.warn(`Quick lore not found for category '${categoryKey}', name '${name}'.`);
            setModalMessage({ show: true, title: "Không Tìm Thấy", content: `Không tìm thấy thông tin chi tiết cho '${name}'.`, type: 'info' });
        }
    }, [knowledgeBase]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error during sign-in:", error);
                    setApiKeyStatus({ status: 'Lỗi xác thực', message: `Không thể xác thực: ${error.message}`, color: 'text-red-500' });
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        try {
            const savedGame = localStorage.getItem('lastPlayedGame');
            if (savedGame) {
                setResumableGameExists(true);
            }
        } catch (error) {
            console.error("Could not read from localStorage", error);
        }
    }, []);

    useEffect(() => {
        if (currentScreen === 'gameplay' && storyHistory.length > 0) {
            const gameState = {
                gameSettings,
                storyHistory,
                chatHistoryForGemini,
                knowledgeBase,
                characterStats,
                gameMemory,
            };
            try {
                localStorage.setItem('lastPlayedGame', JSON.stringify(gameState));
                setResumableGameExists(true);
            } catch (error) {
                console.error("Could not save to localStorage", error);
            }
        }
    }, [storyHistory, characterStats, knowledgeBase, gameSettings, chatHistoryForGemini, currentScreen, gameMemory]);

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setGameSettings((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (name === "difficulty" && value !== "Tuỳ Chỉnh AI") {
            setGameSettings(prev => ({ ...prev, difficultyDescription: '' }));
        }
    }, []);

    const addInitialWorldElement = () => {
        setGameSettings(prev => ({
            ...prev,
            initialWorldElements: [
                ...prev.initialWorldElements,
                { id: crypto.randomUUID(), type: 'NPC', name: '', description: '' }
            ]
        }));
    };

    const removeInitialWorldElement = (id) => {
        setGameSettings(prev => ({
            ...prev,
            initialWorldElements: prev.initialWorldElements.filter(el => el.id !== id)
        }));
    };

    const handleInitialElementChange = (index, event) => {
        const { name, value } = event.target;
        setGameSettings(prev => {
            const updatedElements = [...prev.initialWorldElements];
            updatedElements[index] = { ...updatedElements[index], [name]: value };
            return { ...prev, initialWorldElements: updatedElements };
        });
    };

    const handleGenerateInitialElementDescription = async (index) => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Thiếu API Key', content: 'Vui lòng thiết lập API Key.', type: 'error' });
            setShowSettingsModal(true);
            return;
        }
        const element = gameSettings.initialWorldElements[index];
        if (!element || !element.name) {
            setModalMessage({ show: true, title: "Thiếu Tên", content: "Vui lòng nhập tên thực thể trước khi tạo mô tả.", type: "info" });
            return;
        }

        setIsGeneratingInitialElementDesc(prev => ({ ...prev, [element.id]: true }));

        const { theme, setting, writingStyle } = gameSettings;
        const promptText = `Dựa trên các thông tin sau:
    Chủ đề game: '${theme || "Chưa rõ"}'
    Bối cảnh game: '${setting || "Chưa rõ"}'
    Phong cách viết: '${writingStyle || "Tiểu thuyết mạng Trung Quốc chung"}'
    Tên thực thể: '${element.name}'
    Loại thực thể: '${element.type}'
    Hãy ✨ viết một mô tả ngắn gọn (1-3 câu, tối đa 150 chữ) bằng tiếng Việt cho thực thể này để sử dụng trong việc kiến tạo thế giới ban đầu của trò chơi phiêu lưu văn bản. Mô tả cần phù hợp với các thông tin đã cho.`;

        const generatedText = await fetchGenericGeminiText(promptText);
        if (generatedText) {
            setGameSettings(prev => {
                const updatedElements = [...prev.initialWorldElements];
                updatedElements[index] = { ...updatedElements[index], description: generatedText };
                return { ...prev, initialWorldElements: updatedElements };
            });
        }
        setIsGeneratingInitialElementDesc(prev => ({ ...prev, [element.id]: false }));
    };

    const saveApiKey = async () => {
        if (!userId) {
            setModalMessage({ show: true, title: 'Lỗi', content: 'Người dùng chưa được xác thực để lưu API Key.', type: 'error' });
            return;
        }
        if (!inputApiKey.trim()) {
            setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'API Key không được để trống.', type: 'error' });
            return;
        }
        setIsLoading(true);
        try {
            const apiKeyRef = doc(db, `artifacts/${appId}/users/${userId}/apiCredentials/gemini`);
            await setDoc(apiKeyRef, { key: inputApiKey, lastUpdated: serverTimestamp() });
            setApiKey(inputApiKey);
            setApiMode('userKey');
            setApiKeyStatus({ status: 'Đã lưu', message: 'API Key của bạn đã được lưu thành công!', color: 'text-green-500' });
            setShowSettingsModal(false);
            setModalMessage({ show: true, title: 'Thành Công', content: 'API Key của bạn đã được lưu!', type: 'success' });
        } catch (error) {
            console.error("Error saving API key:", error);
            setApiKeyStatus({ status: 'Lỗi', message: `Lưu API Key thất bại: ${error.message}`, color: 'text-red-500' });
            setModalMessage({ show: true, title: 'Lỗi Lưu API Key', content: `Lưu API Key thất bại: ${error.message}`, type: 'error' });
        }
        setIsLoading(false);
    };

    const loadApiKey = async (currentUserId) => {
        if (!currentUserId) return null;
        try {
            const apiKeyRef = doc(db, `artifacts/${appId}/users/${currentUserId}/apiCredentials/gemini`);
            const docSnap = await getDoc(apiKeyRef);
            if (docSnap.exists()) {
                return docSnap.data().key;
            }
            return null;
        } catch (error) {
            console.error("Error loading API key:", error);
            return null;
        }
    };

    const testApiKey = async () => {
        if (!inputApiKey) {
            setApiKeyStatus({ status: 'Chưa nhập Key', message: 'Vui lòng nhập API Key để kiểm tra.', color: 'text-yellow-500' });
            setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng nhập API Key để kiểm tra.', type: 'info' });
            return;
        }
        setIsLoading(true);
        setApiKeyStatus({ status: 'Đang kiểm tra...', message: 'Vui lòng đợi.', color: 'text-blue-500' });

        const payload = {
            model: "cohere/command-r7b-12-2024:free",
            messages: [{ role: "user", content: "Xin chào! Đây là một bài kiểm tra kết nối." }]
        };
        const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${inputApiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'AI Simulator'
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.choices && result.choices.length > 0) {
                setApiKeyStatus({ status: 'Thành công (Key đang nhập)', message: 'API Key hợp lệ và kết nối thành công!', color: 'text-green-500' });
                setModalMessage({ show: true, title: 'Kiểm Tra Thành Công', content: 'API Key bạn vừa nhập hợp lệ!', type: 'success' });
            } else {
                const errorMessage = result.error?.message || `Mã lỗi ${response.status}. Vui lòng kiểm tra API Key và quyền truy cập.`;
                setApiKeyStatus({ status: 'Thất bại (Key đang nhập)', message: `Kiểm tra API Key thất bại: ${errorMessage}`, color: 'text-red-500' });
                setModalMessage({ show: true, title: 'Kiểm Tra Thất Bại', content: `Chi tiết: ${errorMessage}`, type: 'error' });
            }
        } catch (error) {
            console.error('Error testing API key:', error);
            setApiKeyStatus({ status: 'Lỗi Mạng (Key đang nhập)', message: `Lỗi kết nối: ${error.message}. Vui lòng kiểm tra mạng của bạn.`, color: 'text-red-500' });
            setModalMessage({ show: true, title: 'Lỗi Kết Nối', content: `Không thể kết nối đến API: ${error.message}`, type: 'error' });
        }
        setIsLoading(false);
    };

    // Hàm tạo Request chung có tích hợp TỰ ĐỘNG XOAY VÒNG KEY (Round-Robin) & FALLBACK
    const fetchGenericGeminiText = async (promptText) => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Lỗi API Key', content: 'API Key của bạn chưa được cấu hình. Vui lòng vào Cài Đặt.', type: 'error' });
            setShowSettingsModal(true);
            return null;
        }

        const payload = {
            model: "cohere/command-r7b-12-2024:free",
            messages: [{ role: "user", content: promptText }]
        };

        let keysTried = 0;
        let success = false;
        let generatedText = null;

        // Lấy vị trí key hiện tại từ REF (đảm bảo atomic)
        let attemptIndex = systemKeyIndexRef.current;

        // NGAY LẬP TỨC cộng index lên 1 cho lần gọi tiếp theo (Round Robin)
        if (apiMode === 'systemKeys') {
            systemKeyIndexRef.current = (systemKeyIndexRef.current + 1) % SYSTEM_API_KEYS.length;
        }

        // Vòng lặp xoay vòng Fallback (Dự phòng lỗi)
        while (keysTried < (apiMode === 'systemKeys' ? SYSTEM_API_KEYS.length : 1) && !success) {
            const effectiveApiKey = apiMode === 'systemKeys' ? SYSTEM_API_KEYS[attemptIndex] : apiKey;
            const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${effectiveApiKey}`,
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'AI Simulator'
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    // NẾU LÀ SYSTEM KEYS: Bỏ qua key bị lỗi, tự động thử key tiếp theo trong danh sách
                    if (apiMode === 'systemKeys') {
                        console.warn(`Key tại index [${attemptIndex}] bị lỗi ${response.status}. Chuyển sang key dự phòng...`);
                        attemptIndex = (attemptIndex + 1) % SYSTEM_API_KEYS.length;
                        keysTried++;
                        continue; // Chạy lại vòng lặp với key mới
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.choices && result.choices[0]?.message?.content) {
                    generatedText = result.choices[0].message.content;
                    success = true; // Thoát vòng lặp
                } else {
                    throw new Error(result.error?.message || "Không thể lấy dữ liệu từ AI.");
                }
            } catch (error) {
                console.error('Error in generic fetch:', error);
                if (apiMode === 'systemKeys') {
                    console.warn(`Lỗi mạng/Code với Key index [${attemptIndex}]. Chuyển sang key dự phòng...`);
                    attemptIndex = (attemptIndex + 1) % SYSTEM_API_KEYS.length;
                    keysTried++;
                } else {
                    setModalMessage({ show: true, title: 'Lỗi Mạng', content: `Lỗi kết nối khi gọi AI: ${error.message}`, type: 'error' });
                    return null; // Thoát hẳn nếu dùng User Key
                }
            }
        }

        if (!success && apiMode === 'systemKeys') {
            setModalMessage({ show: true, title: 'Hệ Thống Quá Tải', content: "Tất cả các API Key dự phòng đều đã hết hạn ngạch hoặc bị lỗi. Vui lòng sử dụng API Key riêng của bạn hoặc thử lại sau.", type: 'error' });
            return null;
        }

        return generatedText;
    };

    const handleFetchSuggestions = async (fieldType) => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Thiếu API Key', content: 'Vui lòng thiết lập API Key để sử dụng tính năng này.', type: 'error' });
            setShowSettingsModal(true);
            return;
        }
        setIsFetchingSuggestions(true);
        setShowSuggestionsModal({ show: true, fieldType, suggestions: [], isLoading: true });

        let promptText = '';
        if (fieldType === 'theme') {
            promptText = "Hãy gợi ý 5 chủ đề độc đáo và hấp dẫn bằng tiếng Việt cho một trò chơi phiêu lưu bằng văn bản (text adventure game) theo phong cách tiểu thuyết mạng Trung Quốc. Mỗi chủ đề trên một dòng, không cần đánh số đầu dòng.";
        } else if (fieldType === 'setting') {
            const currentTheme = gameSettings.theme || 'phiêu lưu chung';
            promptText = `Hãy gợi ý 5 bối cảnh (thế giới/môi trường) thú vị và chi tiết bằng tiếng Việt cho một trò chơi phiêu lưu bằng văn bản có chủ đề là '${currentTheme}' theo phong cách tiểu thuyết mạng Trung Quốc. Mỗi bối cảnh trên một dòng, không cần đánh số đầu dòng.`;
        }

        const suggestionsText = await fetchGenericGeminiText(promptText);
        if (suggestionsText) {
            const suggestionsArray = suggestionsText.split('\n').map(s => s.trim()).filter(s => s);
            setShowSuggestionsModal({ show: true, fieldType, suggestions: suggestionsArray, isLoading: false });
        } else {
            setShowSuggestionsModal({ show: true, fieldType, suggestions: [], isLoading: false });
        }
        setIsFetchingSuggestions(false);
    };

    const handleGenerateBackstory = async () => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Thiếu API Key', content: 'Vui lòng thiết lập API Key để sử dụng tính năng này.', type: 'error' });
            setShowSettingsModal(true);
            return;
        }
        setIsGeneratingContent(true);
        const { characterName, characterGender, theme, setting } = gameSettings;
        const promptText = `Dựa vào các thông tin sau: Tên nhân vật='${characterName || 'Nhân vật chính'}', Giới tính='${characterGender}', Chủ đề game='${theme || 'Chưa rõ'}', Bối cảnh game='${setting || 'Chưa rõ'}', hãy ✨ viết một đoạn sơ lược tiểu sử hoặc đặc điểm nổi bật (khoảng 2-3 câu, tối đa 150 chữ) bằng tiếng Việt cho nhân vật này để sử dụng trong một trò chơi phiêu lưu bằng văn bản, theo văn phong tiểu thuyết mạng Trung Quốc.`;

        const backstoryText = await fetchGenericGeminiText(promptText);
        if (backstoryText) {
            setGameSettings(prev => ({ ...prev, characterBackstory: backstoryText }));
        }
        setIsGeneratingContent(false);
    };

    const handleGenerateDifficultyDescription = async () => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Thiếu API Key', content: 'Vui lòng thiết lập API Key để sử dụng tính năng này.', type: 'error' });
            setShowSettingsModal(true);
            return;
        }
        setIsGeneratingDifficultyDesc(true);
        const { theme, setting } = gameSettings;
        const promptText = `Dựa trên chủ đề game là '${theme || "Chưa rõ"}' và bối cảnh '${setting || "Chưa rõ"}', hãy ✨ viết một mô tả ngắn gọn (1-2 câu, tối đa 100 chữ) bằng tiếng Việt về độ khó "Tuỳ Chỉnh AI" cho trò chơi này, theo văn phong tiểu thuyết mạng Trung Quốc. Mô tả này nên gợi ý về những thử thách hoặc đặc điểm riêng của độ khó này.`;

        const descText = await fetchGenericGeminiText(promptText);
        if (descText) {
            setGameSettings(prev => ({ ...prev, difficultyDescription: descText }));
        }
        setIsGeneratingDifficultyDesc(false);
    };

    const handleGeneratePromptSetting = async (settingType) => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Thiếu API Key', content: 'Vui lòng thiết lập API Key.', type: 'error' });
            setShowSettingsModal(true);
            return;
        }
        setIsGeneratingPromptSetting(prev => ({ ...prev, [settingType]: true }));
        const { theme, setting } = gameSettings;
        let userPrompt = `Chủ đề game: '${theme || "Chưa rõ"}'. Bối cảnh: '${setting || "Chưa rõ"}'.`;
        let specificInstruction = "";

        if (settingType === 'writingStyle') {
            specificInstruction = "Hãy ✨ gợi ý 2-3 phong cách viết (khoảng 10-20 từ mỗi phong cách) bằng tiếng Việt cho một trò chơi phiêu lưu văn bản dựa trên chủ đề và bối cảnh trên. Ví dụ: 'Hành văn gay cấn, tập trung vào miêu tả chiến đấu' hoặc 'Ngôn từ hoa mỹ, giàu chất thơ, tập trung vào nội tâm nhân vật'.";
        } else if (settingType === 'specialPlotElements') {
            specificInstruction = "Hãy ✨ gợi ý 2-3 yếu tố cốt truyện đặc biệt (khoảng 10-20 từ mỗi yếu tố) bằng tiếng Việt có thể làm cho trò chơi phiêu lưu văn bản dựa trên chủ đề và bối cảnh trên trở nên độc đáo. Ví dụ: 'Sự phản bội từ người thân cận nhất' hoặc 'Khám phá bí mật cổ xưa bị lãng quên'.";
        } else if (settingType === 'otherAiInstructions') {
            specificInstruction = "Hãy ✨ gợi ý 2-3 hướng dẫn chung khác (khoảng 10-20 từ mỗi hướng dẫn) bằng tiếng Việt để AI có thể kể chuyện tốt hơn cho trò chơi phiêu lưu văn bản dựa trên chủ đề và bối cảnh trên. Ví dụ: 'Tập trung vào sự phát triển của nhân vật chính' hoặc 'Tạo ra nhiều lựa chọn có ảnh hưởng lớn đến cốt truyện'.";
        }

        const promptText = `${userPrompt} ${specificInstruction} Trả về các gợi ý, mỗi gợi ý trên một dòng, không cần đánh số.`;
        const generatedText = await fetchGenericGeminiText(promptText);
        if (generatedText) {
            setGameSettings(prev => ({ ...prev, [settingType]: generatedText }));
        }
        setIsGeneratingPromptSetting(prev => ({ ...prev, [settingType]: false }));
    };

    const handleFetchStorySummary = async () => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Thiếu API Key', content: 'Vui lòng thiết lập API Key để sử dụng tính năng này.', type: 'error' });
            setShowSettingsModal(true);
            return;
        }
        if (storyHistory.length === 0) {
            setModalMessage({ show: true, title: 'Chưa Có Gì Để Tóm Tắt', content: 'Hãy chơi thêm để có diễn biến câu chuyện nhé!', type: 'info' });
            return;
        }

        setIsFetchingSummary(true);
        setShowSummaryModal(true);
        setStorySummary('');

        const relevantHistory = storyHistory
            .filter(item => item.type === 'story' || item.type === 'user_choice' || item.type === 'user_custom_action' || item.type === 'god_action')
            .map(item => {
                if (item.type === 'user_choice') return `Lựa chọn của ngươi: ${item.content}`;
                if (item.type === 'user_custom_action') return `Hành động của ngươi: ${item.content}`;
                if (item.type === 'god_action') return `SỰ KIỆN TỰ NHIÊN/CAN THIỆP: ${item.content}`;
                return item.content;
            })
            .join('\n\n---\n\n');

        const maxHistoryLength = 2000;
        const truncatedHistory = relevantHistory.length > maxHistoryLength
            ? `... (phần trước đã được lược bỏ) ...\n${relevantHistory.slice(-maxHistoryLength)}`
            : relevantHistory;

        const promptText = `Dựa vào lịch sử diễn biến câu chuyện (theo văn phong tiểu thuyết mạng Trung Quốc) sau đây, hãy ✨ tóm tắt lại các sự kiện chính bằng tiếng Việt trong khoảng 3-5 câu ngắn gọn, mạch lạc, sử dụng cách xưng hô phù hợp với tiểu thuyết mạng (ví dụ: "ngươi", "hắn", "bản tọa"):\n\n${truncatedHistory}`;

        const summary = await fetchGenericGeminiText(promptText);
        if (summary) {
            setStorySummary(summary);
        } else {
            setStorySummary("Không thể tạo tóm tắt vào lúc này. Vui lòng thử lại.");
        }
        setIsFetchingSummary(false);
    };

    const parseGeminiResponseAndUpdateState = (text, prevCharacterStats, prevKnowledgeBase, prevGameMemory) => {
        let storyContent = text;
        let extractedChoices = [];

        let newCharacterStats = JSON.parse(JSON.stringify(prevCharacterStats));
        let newKnowledgeBase = JSON.parse(JSON.stringify(prevKnowledgeBase));
        let newGameMemory = [...(prevGameMemory || [])];

        // Đã xóa INVENTORY_, SKILL_, QUEST_, RELATIONSHIP_
        const allTagsRegex = /\[(CHARACTER_UPDATE|LORE_\w+|COMPANION|STATUS_EFFECT|MEMORY_UPDATE):\s*([^\]]+)\]/gs;

        storyContent = storyContent.replace(allTagsRegex, (match, tagName, tagContent) => {
            try {
                const data = parseKeyValueString(tagContent);
                if (!data.Name && !tagName.includes('CHARACTER_UPDATE') && !tagName.includes('MEMORY_UPDATE')) return '';

                switch (tagName) {
                    case 'CHARACTER_UPDATE':
                        for (const key in data) {
                            const value = data[key];
                            const statKey = key.charAt(0).toLowerCase() + key.slice(1);
                            if (typeof value === 'string' && (value.startsWith('+') || value.startsWith('-'))) {
                                const numValue = parseFloat(value.replace('%', ''));
                                if (!isNaN(numValue)) {
                                    const currentValue = newCharacterStats[statKey] || 0;
                                    if (value.includes('%')) {
                                        const maxStatKey = 'max' + key.charAt(0).toUpperCase() + key.slice(1);
                                        const maxVal = newCharacterStats[maxStatKey] || currentValue;
                                        newCharacterStats[statKey] = currentValue + (maxVal * (numValue / 100) * (value.startsWith('+') ? 1 : -1));
                                    } else {
                                        newCharacterStats[statKey] = currentValue + (value.startsWith('+') ? numValue : -numValue);
                                    }
                                }
                            } else {
                                if (statKey in newCharacterStats) newCharacterStats[statKey] = value;
                                else newCharacterStats[key] = value;
                            }
                        }
                        if (newCharacterStats.health > newCharacterStats.maxHealth) newCharacterStats.health = newCharacterStats.maxHealth;
                        if (newCharacterStats.health < 0) newCharacterStats.health = 0;

                        if (newCharacterStats.lifespan > newCharacterStats.maxLifespan) newCharacterStats.lifespan = newCharacterStats.maxLifespan;
                        if (newCharacterStats.lifespan < 0) newCharacterStats.lifespan = 0;
                        break;
                    case 'COMPANION': {
                        const updatedCompanions = [...(newKnowledgeBase.companions || [])];
                        const existingIndex = updatedCompanions.findIndex(c => c.Name === data.Name);
                        if (existingIndex > -1) updatedCompanions[existingIndex] = { ...updatedCompanions[existingIndex], ...data };
                        else updatedCompanions.push(data);
                        newKnowledgeBase.companions = updatedCompanions;
                        break;
                    }
                    case 'STATUS_EFFECT': {
                        const updatedEffects = [...(newKnowledgeBase.statusEffects || [])];
                        const existingIndex = updatedEffects.findIndex(e => e.Name === data.Name);
                        if (existingIndex > -1) updatedEffects[existingIndex] = { ...updatedEffects[existingIndex], ...data };
                        else updatedEffects.push(data);
                        newKnowledgeBase.statusEffects = updatedEffects;
                        break;
                    }
                    case 'MEMORY_UPDATE': {
                        if (data.Content) {
                            if (!newGameMemory.includes(data.Content)) {
                                newGameMemory.push(data.Content);
                                // Ghi nhớ vô hạn - không giới hạn số lượng
                            }
                        } else if (data.Remove) {
                            newGameMemory = newGameMemory.filter(mem => mem !== data.Remove);
                        }
                        break;
                    }
                    default:
                        if (tagName.startsWith('LORE_')) {
                            const loreType = tagName.substring(5).toLowerCase();
                            const categoryKey = loreType.endsWith('s') ? loreType : loreType + 's';
                            const updatedCategory = [...(newKnowledgeBase[categoryKey] || [])];
                            const existingIndex = updatedCategory.findIndex(i => i.Name === data.Name);
                            if (existingIndex > -1) {
                                updatedCategory[existingIndex] = { ...updatedCategory[existingIndex], ...data };
                            } else {
                                updatedCategory.push(data);
                            }
                            newKnowledgeBase[categoryKey] = updatedCategory;
                        }
                        break;
                }
            } catch (e) {
                console.error(`Error parsing tag ${tagName}:`, tagContent, e);
            }
            return '';
        });

        const lines = storyContent.trim().split('\n');
        const potentialChoicesLines = [];
        let choiceStartIndex = -1;

        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line.match(/^\d+[\.\)]\s*.+/) || line.match(/^[-*]\s*.+/)) {
                potentialChoicesLines.unshift(line);
                choiceStartIndex = i;
            } else if (choiceStartIndex !== -1 && line === "") {
                // allow empty lines between choices
            } else if (choiceStartIndex !== -1 && line !== "") {
                break;
            }
        }

        if (choiceStartIndex !== -1) {
            extractedChoices = potentialChoicesLines
                .map(line => line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').trim())
                .filter(choice => choice !== "");
            storyContent = lines.slice(0, choiceStartIndex).join('\n').trim();
        } else {
            storyContent = lines.join('\n').trim();
        }

        return { story: storyContent, choices: extractedChoices, newCharacterStats, newKnowledgeBase, newGameMemory };
    };

    // Hàm gọi API cốt truyện chính có TỰ ĐỘNG XOAY VÒNG KEY & FALLBACK
    const callGeminiAPI = async (prompt, isInitialCall = false) => {
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Lỗi API Key', content: 'API Key của bạn chưa được cấu hình. Vui lòng vào Cài Đặt.', type: 'error' });
            setIsLoading(false);
            setShowSettingsModal(true);
            return;
        }

        if (!isInitialCall && !isProcessingAction) setIsLoading(true);
        else if (isInitialCall) setIsLoading(true);

        let currentChatHistory = [...chatHistoryForGemini];

        if (isInitialCall) {
            currentChatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        } else {
            currentChatHistory.push({ role: "user", parts: [{ text: prompt }] });
        }

        const MAX_HISTORY_LENGTH = Infinity; // Ghi nhớ vô hạn
        if (currentChatHistory.length > MAX_HISTORY_LENGTH) {
            currentChatHistory = currentChatHistory.slice(currentChatHistory.length - MAX_HISTORY_LENGTH);
        }

        const openAiMessages = currentChatHistory.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : msg.role,
            content: msg.parts[0].text
        }));

        const payload = {
            model: "cohere/command-r7b-12-2024:free",
            messages: openAiMessages
        };

        let keysTried = 0;
        let success = false;
        let finalResultText = null;

        // Lấy vị trí key hiện tại
        let attemptIndex = systemKeyIndexRef.current;

        // Tự động xoay vòng cho lần Request tiếp theo
        if (apiMode === 'systemKeys') {
            systemKeyIndexRef.current = (systemKeyIndexRef.current + 1) % SYSTEM_API_KEYS.length;
        }

        // Vòng lặp xoay vòng Fallback (Dự phòng lỗi)
        while (keysTried < (apiMode === 'systemKeys' ? SYSTEM_API_KEYS.length : 1) && !success) {
            const effectiveApiKey = apiMode === 'systemKeys' ? SYSTEM_API_KEYS[attemptIndex] : apiKey;
            const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${effectiveApiKey}`,
                        'HTTP-Referer': window.location.href,
                        'X-Title': 'AI Simulator'
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    if (apiMode === 'systemKeys') {
                        console.warn(`[GameLoop] Key tại index [${attemptIndex}] bị lỗi ${response.status}. Chuyển sang key dự phòng...`);
                        attemptIndex = (attemptIndex + 1) % SYSTEM_API_KEYS.length;
                        keysTried++;
                        continue; // Bỏ qua phần dưới, quay lại đầu vòng lặp để lấy key mới
                    }
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }

                const result = await response.json();

                if (result.choices && result.choices[0]?.message?.content) {
                    finalResultText = result.choices[0].message.content;
                    success = true; // Thoát vòng lặp
                } else {
                    throw new Error(result.error?.message || "Không nhận được phản hồi hợp lệ từ Gemini.");
                }
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                if (apiMode === 'systemKeys') {
                    console.warn(`[GameLoop] Lỗi mạng với Key index [${attemptIndex}]. Chuyển sang key dự phòng...`);
                    attemptIndex = (attemptIndex + 1) % SYSTEM_API_KEYS.length;
                    keysTried++;
                } else {
                    const networkError = `Lỗi kết nối đến Gemini API: ${error.message}. Vui lòng kiểm tra kết nối mạng.`;
                    setStoryHistory(prev => [...prev, { type: 'system', content: networkError }]);
                    setChoices([]);
                    setModalMessage({ show: true, title: 'Lỗi Mạng', content: networkError, type: 'error' });
                    break; // Thoát hẳn
                }
            }
        }

        // Xử lý kết quả sau khi vòng lặp kết thúc
        if (success && finalResultText) {
            let { story, choices: newChoices, newCharacterStats, newKnowledgeBase, newGameMemory } = parseGeminiResponseAndUpdateState(finalResultText, characterStats, knowledgeBase, gameMemory);

            if (!story || !story.trim()) {
                story = "Thế giới đã thay đổi theo ý chí của ngươi, nhưng không có lời nào để diễn tả khoảnh khắc này.";
            }

            const newStoryEntry = { type: 'story', content: story };

            setCharacterStats(newCharacterStats);
            setKnowledgeBase(newKnowledgeBase);
            setGameMemory(newGameMemory);
            setStoryHistory(prev => [...prev, newStoryEntry]);
            setChoices(newChoices);

            const updatedChatHistory = [...currentChatHistory, { role: "model", parts: [{ text: finalResultText }] }];
            setChatHistoryForGemini(updatedChatHistory);

        } else if (apiMode === 'systemKeys' && !success) {
            // Hết tất cả các key
            const errorText = "Hệ thống Quá Tải: Toàn bộ API Key dự phòng đều đã cạn kiệt hoặc bị lỗi. Vui lòng tự cung cấp API Key của riêng bạn trong mục Cài Đặt hoặc quay lại sau.";
            setStoryHistory(prev => [...prev, { type: 'system', content: errorText }]);
            setChoices([]);
            setModalMessage({ show: true, title: 'Hết API Key', content: errorText, type: 'error' });
        }

        if (!isProcessingAction) setIsLoading(false);
    };

    const initializeGame = async () => {
        if (!gameSettings.theme || !gameSettings.setting || !gameSettings.characterName || !gameSettings.characterBackstory) {
            setModalMessage({ show: true, title: 'Thiếu Thông Tin', content: 'Vui lòng điền đầy đủ thông tin Chủ đề, Bối cảnh, Tên nhân vật và Sơ lược tiểu sử.', type: 'error' });
            return;
        }
        if (gameSettings.difficulty === "Tuỳ Chỉnh AI" && !gameSettings.difficultyDescription) {
            setModalMessage({ show: true, title: 'Thiếu Mô Tả Độ Khó', content: 'Vui lòng tạo hoặc nhập mô tả cho độ khó "Tuỳ Chỉnh AI".', type: 'error' });
            return;
        }
        if (apiMode === 'userKey' && !apiKey) {
            setModalMessage({ show: true, title: 'Thiếu API Key', content: 'Vui lòng thiết lập API Key của bạn hoặc chọn hệ thống đa key tự động.', type: 'error' });
            setShowSettingsModal(true);
            return;
        }

        localStorage.removeItem('lastPlayedGame');
        setResumableGameExists(false);

        setChoices([]);
        setStoryHistory([]);
        setChatHistoryForGemini([]);
        setKnowledgeBase({ npcs: [], items: [], locations: [], companions: [], statusEffects: [] });
        setGameMemory([]);

        let initialRealmPrompt = "Luyện Khí Tầng Một";
        let initialRealmDisplay = "Phàm Nhân";

        if (gameSettings.initialRealmInputMode === 'random') {
            initialRealmPrompt = "Ngẫu nhiên (Tự quyết định phù hợp bối cảnh)";
            initialRealmDisplay = "Đang xác định...";
        } else if (gameSettings.initialRealmInputMode === 'custom' && gameSettings.initialRealm) {
            initialRealmPrompt = gameSettings.initialRealm;
            initialRealmDisplay = gameSettings.initialRealm;
        } else {
            initialRealmPrompt = "Cấp độ thấp nhất/Người mới bắt đầu";
            initialRealmDisplay = "Người mới";
        }

        const initialStats = {
            name: gameSettings.characterName,
            age: 16,
            realm: initialRealmDisplay,
            health: 100, maxHealth: 100,
            cultivation: 0, experience: 0, nextLevelExp: 100,
            innateTalent: 'Bình thường', physique: 10, luck: 5, combatPower: 20,
            personality: 'Chưa xác định'
        };
        setCharacterStats(initialStats);

        const initialWorldElementsString = gameSettings.initialWorldElements
            .map(el => `- Loại: ${el.type}, Tên: ${el.name}, Mô tả: ${el.description}`)
            .join('\n');

        const initialPrompt = `
        Bạn là một Hệ Thống kể chuyện thông minh (AI Storyteller). 
        
        **QUAN TRỌNG NHẤT: VĂN PHONG VÀ CHỦ ĐỀ**
        - Chủ đề người chơi chọn: '${gameSettings.theme}'.
        - Bối cảnh: '${gameSettings.setting}'.
        - Hãy TỰ ĐỘNG ĐIỀU CHỈNH giọng văn, xưng hô và thuật ngữ cho phù hợp tuyệt đối với chủ đề này.
          + Nếu là Tiên Hiệp: dùng "bản tọa", "đạo hữu", "tại hạ", "linh khí".
          + Nếu là Đô Thị/Hiện Đại: dùng "tôi", "anh", "cậu", "súng", "xe hơi".
          + Nếu là Phương Tây/Fantasy: dùng "ngài", "ta", "phép thuật", "hiệp sĩ".
          + Nếu là Trinh Thám/Kinh Dị: giọng văn lạnh lùng, bí ẩn, logic.
        
        **THÔNG TIN KHỞI TẠO:**
        - Độ khó: ${gameSettings.difficulty} ${gameSettings.difficultyDescription ? `(${gameSettings.difficultyDescription})` : ''}
        - Nhân vật chính: Tên=${gameSettings.characterName}, Giới tính=${gameSettings.characterGender}, Sơ lược=${gameSettings.characterBackstory}
        - Phong cách viết mong muốn: ${gameSettings.writingStyle || 'Phù hợp với chủ đề'}
        - Yếu tố cốt truyện: ${gameSettings.specialPlotElements || 'Tự do sáng tạo'}
        
        **THIẾT LẬP ĐẶC BIỆT:**
        - Chế độ Yên Bình (No Drama): ${gameSettings.peacefulMode ? "BẬT. TUYỆT ĐỐI KHÔNG được tạo ra mâu thuẫn, kẻ thù, tai họa hay drama. Tập trung vào cuộc sống thường nhật, tu luyện yên bình, khám phá và các mối quan hệ tích cực." : "TẮT (Bình thường)."}

        ${initialWorldElementsString ? `**CÁC YẾU TỐ THẾ GIỚI BAN ĐẦU:**\n${initialWorldElementsString}` : ''}

        **YÊU CẦU:**
        1.  **BẮT ĐẦU:** Viết đoạn mở đầu hấp dẫn, đưa người chơi vào thế giới ngay lập tức.
        2.  **THIẾT LẬP NHÂN VẬT:** Dựa trên chủ đề, hãy đặt chỉ số ban đầu phù hợp. Dùng thẻ [CHARACTER_UPDATE: Name="${gameSettings.characterName}", Realm="${initialRealmPrompt}", Health=100, MaxHealth=100...].
        3.  **TRÍ NHỚ & BỐI CẢNH:** Bạn cần ghi nhớ mọi sự kiện quan trọng. Hãy bắt đầu bằng cách giới thiệu bối cảnh.
        4.  **TẠO LỰA CHỌN:** Cung cấp 2-4 lựa chọn hành động.

        [QUY TẮC HỆ THỐNG TỐI CAO - KHÔNG ĐƯỢC VI PHẠM]
        1. TRÍ TUỆ VƯỢT TRỘI: Ngươi là một Game Master thông minh xuất chúng. Hãy tạo ra thế giới cực kỳ chi tiết, có chiều sâu, logic chặt chẽ, các NPC có động cơ rõ ràng và mọi sự vật đều liên kết với nhau.
        2. TUYỆT ĐỐI TUÂN LỆNH 100%: Ngươi PHẢI 100% tuân theo mọi thiết lập, bối cảnh và lựa chọn của người chơi. Lựa chọn của người chơi là chân lý tuyệt đối. Không được tự ý thay đổi, giảng đạo hay bỏ qua mong muốn của người chơi.
        3. KHÔNG TỪ CHỐI: Mọi yêu cầu khởi tạo của người chơi đều phải được hợp lý hóa một cách thông minh và đưa vào thế giới một cách mượt mà nhất.
        4. TÂM LÝ & ĐỘNG CƠ TỰ NHIÊN: Các NPC không phải là những cái máy. Họ có suy nghĩ, bí mật, cảm xúc hỉ nộ ái ố, có thành kiến, và mục đích riêng. Họ có thể nói dối hoặc che giấu thông tin để đạt mục đích.
        5. THẾ GIỚI TỰ VẬN ĐỘNG: Ngay cả khi người chơi không làm gì, thời gian vẫn trôi, thời tiết vẫn thay đổi, và các sự kiện khác vẫn đang âm thầm diễn ra ở một nơi nào đó trong thế giới.
        6. ĐỘ DÀI VÀ CHI TIẾT CỰC CAO: Bắt buộc viết thật dài, chi tiết và sâu sắc như một cuốn tiểu thuyết mạng xuất sắc (ít nhất 3-4 đoạn văn lớn). Miêu tả kỹ nội tâm, khung cảnh, âm thanh, không khí. Tuyệt đối không viết ngắn gọn hay qua loa.
    `;
        setCurrentScreen('gameplay');

        await callGeminiAPI(initialPrompt, true);

    };

    const handleChoice = (choiceText) => {
        const userChoiceEntry = { type: 'user_choice', content: choiceText };
        setStoryHistory(prev => [...prev, userChoiceEntry]);
        setChoices([]);

        const knownNPCs = knowledgeBase.npcs.map(n => n.Name).join(', ') || 'Chưa gặp ai';
        const longTermMemoryStr = gameMemory.length > 0 ? gameMemory.join('; ') : 'Chưa có ghi nhớ quan trọng nào.';

        const subsequentPrompt = `
        **NHẮC LẠI VĂN PHONG:** Hãy giữ vững giọng văn phù hợp với chủ đề '${gameSettings.theme}'.
        **TRÍ NHỚ TUYỆT ĐỐI:** Đây là những gì đã xảy ra (Ký Ức Dài Hạn): ${longTermMemoryStr}. KHÔNG ĐƯỢC QUÊN các sự kiện này.
        ${gameSettings.peacefulMode ? "**CHẾ ĐỘ YÊN BÌNH:** Duy trì không khí nhẹ nhàng, không drama, không kẻ thù xuất hiện bất ngờ. Tập trung vào đời sống, trải nghiệm." : ""}
        
        Người chơi (${characterStats.name}) chọn: "${choiceText}".

        **BỐI CẢNH HIỆN TẠI:**
        - Trạng thái: ${characterStats.realm} | HP: ${characterStats.health}/${characterStats.maxHealth}
        - Đang gặp: ${knownNPCs}

        **YÊU CẦU:**
        1. Viết tiếp diễn biến câu chuyện một cách logic và cuốn hút.
        2. Cập nhật chỉ số nhân vật/thế giới bằng các thẻ [TAG].
        3. Nếu có sự kiện quan trọng (gặp trùm, bí mật lớn, thù hận...), dùng thẻ [MEMORY_UPDATE: Content="..."] để ghi nhớ mãi mãi.
        4. Đưa ra 2-4 lựa chọn tiếp theo.
        
        [LỆNH CỐT LÕI QUÁ TRÌNH CHƠI - BẮT BUỘC TUÂN THỦ]
        1. ĐÁP ỨNG 100% LỰA CHỌN: Dù người chơi chọn hành động điên rồ, phi lý hay đặc biệt đến đâu, bắt buộc PHẢI 100% chấp nhận và cho câu chuyện tiếp diễn theo đúng ý người chơi. KHÔNG được cản trở hay từ chối hành động.
        2. HỆ QUẢ THÔNG MINH (BUTTERFLY EFFECT): Là AI thông minh nhất, hãy tạo ra các hệ quả cực kỳ logic, sâu sắc và tinh tế dựa trên hành động của người chơi. Tính toán sự thay đổi của thế giới và NPC thật tự nhiên.
        3. NHẬP VAI HOÀN HẢO: Giữ vững văn phong sắc bén, miêu tả sinh động mọi giác quan, khiến thế giới chân thực nhất có thể.
        4. TÂM LÝ HỌC NPC: NPC phải phản ứng dựa trên cảm xúc và động cơ cá nhân. Nếu người chơi đối xử tệ, họ sẽ thù dai, nói dối hoặc đâm sau lưng. Nếu người chơi tốt, họ sẽ đền đáp nhưng vẫn giữ bí mật riêng.
        5. DÒNG CHẢY THỜI GIAN: Bắt buộc lồng ghép mô tả sự trôi đi của thời gian, sự thay đổi của cảnh vật, hoặc một sự kiện ngẫu nhiên đang diễn ra xung quanh để thế giới không bị "đóng băng".
        6. ĐỘ DÀI VÀ CHI TIẾT CỰC CAO: Bắt buộc viết thật dài, chi tiết và sâu sắc như một cuốn tiểu thuyết (ít nhất 3-4 đoạn văn lớn). Miêu tả rõ nội tâm, mồ hôi, mùi vị, âm thanh vũ khí hoặc phép thuật. Tuyệt đối KHÔNG viết tóm tắt hay qua loa.
    `;
        callGeminiAPI(subsequentPrompt);
    };

    const handleCustomAction = (actionText, isGodMode = false) => {
        if (!actionText.trim()) {
            setModalMessage({ show: true, title: 'Hành Động Trống', content: 'Vui lòng nhập hành động.', type: 'info' });
            return;
        }

        const actionEntry = { type: isGodMode ? 'god_action' : 'user_custom_action', content: actionText };
        setStoryHistory(prev => [...prev, actionEntry]);
        setChoices([]);
        setCustomActionInput('');
        if (isGodMode) setIsGodMode(false);

        const knownNPCs = knowledgeBase.npcs.map(n => n.Name).join(', ') || 'Chưa gặp ai';
        const longTermMemoryStr = gameMemory.length > 0 ? gameMemory.join('; ') : 'Chưa có ghi nhớ quan trọng nào.';

        let subsequentPrompt = "";

        if (isGodMode) {
            subsequentPrompt = `
            **CAN THIỆP TỪ TÁC GIẢ/TỰ NHIÊN (GOD MODE):**
            Người điều khiển thực tại vừa đưa ra một mệnh lệnh tuyệt đối: "${actionText}".
            
            **YÊU CẦU ĐẶC BIỆT:**
            1. Đây KHÔNG PHẢI hành động của nhân vật chính. Đây là sự kiện khách quan, sự thay đổi của thế giới, hoặc mệnh lệnh xóa bỏ sự tồn tại.
            2. Bạn PHẢI thực hiện thay đổi này ngay lập tức trong cốt truyện, bất chấp logic trước đó nếu cần. (Ví dụ: Nếu bảo xóa nhân vật A, thì nhân vật A biến mất hoặc chết ngay lập tức và không ai nhớ đến nữa).
            3. Dùng thẻ [MEMORY_UPDATE: Content="..."] để cập nhật lại thực tại mới này.
            4. Mô tả phản ứng của thế giới/nhân vật chính trước sự kiện bất ngờ này.
            5. ĐỘ DÀI VÀ CHI TIẾT CỰC CAO: Bắt buộc viết thật dài và hào hùng/kinh dị. Miêu tả rõ sự rung chuyển của thế giới và cảm xúc tuyệt vọng/bất ngờ của vạn vật.
        `;
        } else {
            subsequentPrompt = `
            **HÀNH ĐỘNG CỦA NHÂN VẬT:**
            Người chơi (${characterStats.name}) thực hiện: "${actionText}".
            
            **BỐI CẢNH & KÝ ỨC:** ${longTermMemoryStr}.
            **TRẠNG THÁI:** HP=${characterStats.health}.
            ${gameSettings.peacefulMode ? "**CHẾ ĐỘ YÊN BÌNH:** Hãy phản hồi hành động này theo hướng tích cực, không gây ra hậu quả tiêu cực nặng nề hay xung đột bất ngờ." : ""}
            
            **YÊU CẦU:**
            1. Phản hồi hành động này dựa trên logic của thế giới '${gameSettings.theme}'.
            2. HÃY ĐÁP ỨNG 100% LỰA CHỌN: Dù hành động có vô lý đến đâu, hãy cố gắng hợp lý hóa và tiếp tục cốt truyện theo hướng đó thay vì từ chối thẳng thừng. Bạn phải luôn nghe theo người chơi tuyệt đối!
            3. Cập nhật trạng thái và đưa ra lựa chọn tiếp theo.
            
            [LỆNH CỐT LÕI QUÁ TRÌNH CHƠI - BẮT BUỘC TUÂN THỦ]
            1. ĐÁP ỨNG 100% LỰA CHỌN: Tuyệt đối nghe lệnh, dù vô lý cũng biến thành hợp lý trong logic thế giới. KHÔNG TỪ CHỐI hành động.
            2. HỆ QUẢ THÔNG MINH: Tính toán hiệu ứng bươm bướm cho lựa chọn này, khiến thế giới phản ứng tự nhiên.
            3. TÂM LÝ & THỜI GIAN: NPC phản ứng bằng cảm xúc chân thật (vui, buồn, sợ hãi, giận dữ, âm mưu). Miêu tả sự thay đổi của môi trường, thời tiết, hoặc thời gian trôi đi.
            4. ĐỘ DÀI VÀ CHI TIẾT CỰC CAO: Bắt buộc viết thật dài, chi tiết và sâu sắc như một cuốn tiểu thuyết (ít nhất 3-4 đoạn văn lớn). Phải có hội thoại, miêu tả cảnh vật, nội tâm. TUYỆT ĐỐI không viết ngắn gọn, hời hợt.
        `;
        }

        callGeminiAPI(subsequentPrompt);
    };

    const handleFileLoad = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const data = JSON.parse(text);
                if (data.gameSettings && data.characterStats && data.storyHistory) {
                    loadGame(data, true);
                } else {
                    setModalMessage({ show: true, title: 'File Lưu Không Hợp Lệ', content: 'File bạn tải lên không có cấu trúc của một file lưu game hợp lệ.', type: 'error' });
                }
            } catch (error) {
                console.error("Error loading game from file:", error);
                setModalMessage({ show: true, title: 'Lỗi Đọc File', content: `Không thể đọc file lưu game: ${error.message}`, type: 'error' });
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    };

    const handleDownloadSave = () => {
        const gameState = {
            gameSettings,
            storyHistory,
            chatHistoryForGemini,
            knowledgeBase,
            characterStats,
            gameMemory,
        };

        const dataStr = JSON.stringify(gameState, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        link.download = `TuTienAI_Save_${timestamp}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setModalMessage({ show: true, title: 'Đã Tải Xuống', content: 'File lưu game đã được tải về máy của ngươi.', type: 'success' });
    };

    const handleResumeGame = () => {
        try {
            const savedGameJSON = localStorage.getItem('lastPlayedGame');
            if (savedGameJSON) {
                const savedGameData = JSON.parse(savedGameJSON);
                loadGame(savedGameData, true);
            }
        } catch (error) {
            console.error("Failed to resume game from localStorage", error);
            setModalMessage({ show: true, title: 'Lỗi Tải Game', content: 'Không thể tiếp tục cuộc phiêu lưu trước đó. File lưu có thể đã bị hỏng.', type: 'error' });
            localStorage.removeItem('lastPlayedGame');
            setResumableGameExists(false);
        }
    };

    const loadGame = async (gameData, isFromFile = false) => {
        if (!gameData) return;

        setGameSettings(gameData.gameSettings || {
            theme: '', setting: '', characterName: '', characterGender: 'Không xác định',
            characterBackstory: '', difficulty: 'Thường', difficultyDescription: '',
            allowNsfw: false, peacefulMode: false, writingStyle: '', specialPlotElements: '', otherAiInstructions: '', initialWorldElements: [],
            initialRealmInputMode: 'system', initialRealm: ''
        });
        setStoryHistory(gameData.storyHistory || []);
        setChatHistoryForGemini(gameData.chatHistoryForGemini || []);
        setKnowledgeBase(gameData.knowledgeBase || { npcs: [], items: [], locations: [], companions: [], statusEffects: [] });
        setGameMemory(gameData.gameMemory || []);

        setCharacterStats(gameData.characterStats || {
            name: gameData.gameSettings?.characterName || 'Vô Danh', age: 16, realm: 'Phàm Nhân', health: 100, maxHealth: 100,
            cultivation: 0, experience: 0, nextLevelExp: 100,
            innateTalent: 'Bình thường', physique: 10, luck: 5, combatPower: 20,
            personality: 'Chưa xác định'
        });

        if (apiMode === 'userKey' && !apiKey && userId) {
            const userApiKey = await loadApiKey(userId);
            if (userApiKey) {
                setApiKey(userApiKey);
                setInputApiKey(userApiKey);
                setApiKeyStatus({ status: 'Đã kết nối', message: 'API Key đã được tải.', color: 'text-green-500' });
            } else {
                setApiKeyStatus({ status: 'Chưa cấu hình', message: 'Vui lòng nhập API Key của bạn.', color: 'text-yellow-500' });
                setShowSettingsModal(true);
                setCurrentScreen('initial');
                setModalMessage({ show: true, title: 'Cần API Key', content: 'Vui lòng cấu hình API Key của bạn để tiếp tục tải game.', type: 'info' });
                return;
            }
        }

        setChoices([]);
        if (gameData.chatHistoryForGemini && gameData.chatHistoryForGemini.length > 0) {
            const lastModelResponse = gameData.chatHistoryForGemini.filter(h => h.role === 'model').pop();
            if (lastModelResponse) {
                const { choices: loadedChoices } = parseGeminiResponseAndUpdateState(lastModelResponse.parts[0].text, gameData.characterStats, gameData.knowledgeBase, gameData.gameMemory);
                setChoices(loadedChoices);
            }
        }

        setCurrentScreen('gameplay');
        console.log("Game loaded from local file");
    };

    const restartGame = () => {
        setConfirmationModal({
            show: true,
            title: 'Bắt Đầu Lại Game?',
            content: 'Ngươi có muốn lưu tiến trình hiện tại về máy trước khi bắt đầu lại không?',
            onConfirm: () => {
                if (storyHistory.length > 0) {
                    handleDownloadSave();
                }
                performRestart();
            },
            onCancel: () => {
                performRestart();
            },
            confirmText: 'Lưu và Bắt đầu lại',
            cancelText: 'Bắt đầu lại (Không lưu)'
        });
    };

    const performRestart = () => {
        setGameSettings({
            theme: '', setting: '', characterName: '', characterGender: 'Không xác định',
            characterBackstory: '', difficulty: 'Thường', difficultyDescription: '',
            allowNsfw: false, peacefulMode: false, writingStyle: '', specialPlotElements: '', otherAiInstructions: '', initialWorldElements: [],
            initialRealmInputMode: 'system', initialRealm: ''
        });
        setStoryHistory([]);
        setChatHistoryForGemini([]);
        setKnowledgeBase({ npcs: [], items: [], locations: [], companions: [], statusEffects: [] });
        setGameMemory([]);
        setCustomActionInput('');
        localStorage.removeItem('lastPlayedGame');
        setResumableGameExists(false);
        setCurrentScreen('setup');
    };

    const goHome = () => {
        if (currentScreen === 'gameplay' && storyHistory.length > 0) {
            setConfirmationModal({
                show: true,
                title: 'Về Trang Chủ?',
                content: 'Ngươi có muốn lưu tiến trình game hiện tại về máy không?',
                onConfirm: () => {
                    handleDownloadSave();
                    setCurrentScreen('initial');
                },
                onCancel: () => {
                    setCurrentScreen('initial');
                },
                confirmText: 'Lưu và Về Home',
                cancelText: 'Về Home (Không lưu)'
            });
        } else {
            setCurrentScreen('initial');
        }
    };

    const formatStoryText = useCallback((text) => {
        if (!text) return null;

        const processLine = (lineContent) => {
            let segments = [{ type: 'text', content: lineContent }];

            if (knowledgeBase) {
                ['companions', 'statusEffects', 'npcs', 'items', 'locations'].forEach(category => {
                    (knowledgeBase[category] || []).forEach(loreItem => {
                        if (loreItem.Name && loreItem.Name.trim() !== "") {
                            const newSegments = [];
                            segments.forEach(segment => {
                                if (segment.type === 'text') {
                                    const regex = new RegExp(`(${loreItem.Name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                                    const parts = segment.content.split(regex);
                                    for (let i = 0; i < parts.length; i++) {
                                        if (parts[i].trim().toLowerCase() === loreItem.Name.trim().toLowerCase()) {
                                            newSegments.push({ type: 'lore', text: parts[i], category, loreName: loreItem.Name });
                                        } else if (parts[i] !== "") {
                                            newSegments.push({ type: 'text', content: parts[i] });
                                        }
                                    }
                                } else {
                                    newSegments.push(segment);
                                }
                            });
                            segments = newSegments;
                        }
                    });
                });
            }

            return segments.map((segment, index) => {
                if (segment.type === 'text') {
                    let formattedSegment = segment.content;
                    formattedSegment = formattedSegment.replace(/^(.*?):\s*"(.*?)"/, (match, p1, p2) => `<strong class="text-blue-400">${p1}:</strong> "${p2}"`);
                    formattedSegment = formattedSegment.replace(/\*(.*?)\*/g, '<em class="text-purple-400 italic">"$1"</em>');
                    formattedSegment = formattedSegment.replace(/_(.*?)_/g, '<em class="text-purple-400 italic">"$1"</em>');
                    formattedSegment = formattedSegment.replace(/\[(?!LORE_|COMPANION|STATUS_EFFECT|CHARACTER_UPDATE|MEMORY_)(.*?)\]/g, '<span class="text-yellow-400 font-semibold">[$1]</span>');
                    formattedSegment = formattedSegment.replace(/\*\*(.*?)\*\*/g, '<strong class="text-xl block my-2 text-green-400">$1</strong>');
                    return <span key={`segment-${index}`} dangerouslySetInnerHTML={{ __html: formattedSegment }} />;
                } else if (segment.type === 'lore') {
                    return (
                        <span
                            key={`lore-${segment.loreName}-${index}`}
                            className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer font-semibold"
                            onClick={(e) => {
                                e.stopPropagation();
                                openQuickLoreModal(segment.category, segment.loreName);
                            }}
                        >
                            {segment.text}
                        </span>
                    );
                }
                return null; 
            });
        };

        return text.split(/\n\s*\n/).map((paragraph, pIndex) => (
            <p key={`p-${pIndex}`} className="mb-3 leading-relaxed">
                {paragraph.split('\n').map((line, lineIndex) => (
                    <React.Fragment key={`line-${lineIndex}`}>
                        {processLine(line)}
                        {lineIndex < paragraph.split('\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
            </p>
        ));
    }, [knowledgeBase, openQuickLoreModal]);

    if (!isAuthReady) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-['Arial',_sans-serif]">
                <div className="text-2xl animate-pulse"> Đang tải và xác thực...</div>
            </div>
        );
    }

    return (
        <div className="font-['Arial',_sans-serif] text-white">
            <input type="file" ref={fileInputRef} onChange={handleFileLoad} className="hidden" accept=".json" />
            {currentScreen === 'initial' && (
                <InitialScreen
                    setCurrentScreen={setCurrentScreen}
                    onLoadFromFileClick={() => fileInputRef.current.click()}
                    apiKeyStatus={apiKeyStatus}
                    userId={userId}
                    setShowSettingsModal={setShowSettingsModal}
                    apiMode={apiMode}
                    resumableGameExists={resumableGameExists}
                    handleResumeGame={handleResumeGame}
                />
            )}
            {currentScreen === 'setup' && (
                <GameSetupScreen
                    goHome={goHome}
                    gameSettings={gameSettings}
                    handleInputChange={handleInputChange}
                    initializeGame={initializeGame}
                    isLoading={isLoading}
                    apiKey={apiKey}
                    handleFetchSuggestions={handleFetchSuggestions}
                    isFetchingSuggestions={isFetchingSuggestions}
                    handleGenerateBackstory={handleGenerateBackstory}
                    isGeneratingContent={isGeneratingContent}
                    apiMode={apiMode}
                    handleGenerateDifficultyDescription={handleGenerateDifficultyDescription}
                    isGeneratingDifficultyDesc={isGeneratingDifficultyDesc}
                    handleGeneratePromptSetting={handleGeneratePromptSetting}
                    isGeneratingPromptSetting={isGeneratingPromptSetting}
                    addInitialWorldElement={addInitialWorldElement}
                    removeInitialWorldElement={removeInitialWorldElement}
                    handleInitialElementChange={handleInitialElementChange}
                    handleGenerateInitialElementDescription={handleGenerateInitialElementDescription}
                    isGeneratingInitialElementDesc={isGeneratingInitialElementDesc}
                    setShowSettingsModal={setShowSettingsModal}
                />
            )}
            {currentScreen === 'gameplay' && (
                <GameplayScreen
                    goHome={goHome}
                    gameSettings={gameSettings}
                    restartGame={restartGame}
                    storyHistory={storyHistory}
                    isLoading={isLoading}
                    choices={choices}
                    handleChoice={handleChoice}
                    formatStoryText={formatStoryText}
                    customActionInput={customActionInput}
                    setCustomActionInput={setCustomActionInput}
                    handleCustomAction={handleCustomAction}
                    setShowLoreModal={setShowLoreModal}
                    handleFetchStorySummary={handleFetchStorySummary}
                    isFetchingSummary={isFetchingSummary}
                    isProcessingAction={isProcessingAction}
                    characterStats={characterStats}
                    handleManualSave={handleDownloadSave}
                    chatHistoryForGemini={chatHistoryForGemini}
                    isDevMode={isDevMode}
                    isGodMode={isGodMode}
                    setIsGodMode={setIsGodMode}
                />
            )}
            <SettingsModal
                show={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                inputApiKey={inputApiKey}
                setInputApiKey={setInputApiKey}
                apiKeyStatus={apiKeyStatus}
                saveApiKey={saveApiKey}
                testApiKey={testApiKey}
                isLoading={isLoading}
                apiKey={apiKey}
                setApiKeyStatus={setApiKeyStatus}
                apiMode={apiMode}
                setApiMode={setApiMode}
                setModalMessage={setModalMessage}
                isDevMode={isDevMode}
                setIsDevMode={setIsDevMode}
            />
            {showLoreModal && (
                <LoreModal
                    knowledge={knowledgeBase}
                    show={showLoreModal}
                    onClose={() => setShowLoreModal(false)}
                />
            )}
            {showQuickLoreModal && (
                <QuickLoreModal
                    loreItem={quickLoreContent}
                    show={showQuickLoreModal}
                    onClose={() => setShowQuickLoreModal(false)}
                />
            )}
            <SuggestionsModal
                show={showSuggestionsModal.show}
                title={showSuggestionsModal.fieldType === 'theme' ? "✨ Gợi Ý Chủ Đề" : "✨ Gợi Ý Bối Cảnh"}
                suggestions={showSuggestionsModal.suggestions}
                isLoading={showSuggestionsModal.isLoading}
                onSelect={(suggestion) => {
                    setGameSettings(prev => ({ ...prev, [showSuggestionsModal.fieldType]: suggestion }));
                }}
                onClose={() => setShowSuggestionsModal({ show: false, fieldType: null, suggestions: [], isLoading: false })}
            />
            <SummaryModal
                show={showSummaryModal}
                title="✨ Tóm Tắt Câu Chuyện"
                summaryText={storySummary}
                isLoading={isFetchingSummary}
                onClose={() => setShowSummaryModal(false)}
            />
            <MessageModal
                show={modalMessage.show}
                title={modalMessage.title}
                content={modalMessage.content}
                type={modalMessage.type}
                onClose={() => setModalMessage({ show: false, title: '', content: '', type: 'info' })}
            />
            <ConfirmationModal
                show={confirmationModal.show}
                title={confirmationModal.title}
                content={confirmationModal.content}
                onConfirm={confirmationModal.onConfirm}
                onCancel={confirmationModal.onCancel}
                confirmText={confirmationModal.confirmText}
                cancelText={confirmationModal.cancelText}
                setConfirmationModal={setConfirmationModal}
            />
        </div>
    );
};

export default App;