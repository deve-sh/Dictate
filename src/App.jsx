import { createSignal } from "solid-js";

function isSpeechRecognitionSupported() {
	const SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;

	return !!SpeechRecognition;
}

function setupAudioRecordingEngine() {
	const SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition;

	const speechRecognitionRef = new SpeechRecognition();

	speechRecognitionRef.continuous = false;
	speechRecognitionRef.lang = navigator.language;
	speechRecognitionRef.interimResults = true;
	speechRecognitionRef.maxAlternatives = 1;

	return speechRecognitionRef;
}

function App() {
	if (!isSpeechRecognitionSupported())
		return <>Your device or browser doesn't support audio recording.</>;

	const speechRecognitionRef = setupAudioRecordingEngine();

	const [copyableAndEditableText, setCopyableAndEditableText] =
		createSignal("");
	const [currentlyBeingSpokenText, setCurrentlyBeingSpokenText] =
		createSignal("");

	const [listeningToAudio, setListeningToAudio] = createSignal(false);
	const [speechRecognitionError, setSpeechRecognitionError] =
		createSignal(null);

	speechRecognitionRef.onresult = (event) => {
		const transcriptOfWhatUserHasJustSaid = event.results[0][0].transcript;
		setCurrentlyBeingSpokenText(transcriptOfWhatUserHasJustSaid);
	};

	const startRecording = () => {
		speechRecognitionRef.start();
		setListeningToAudio(true);
	};

	const stopRecording = () => {
		speechRecognitionRef.stop();
		setListeningToAudio(false);
	};

	speechRecognitionRef.onend = () => {
		setListeningToAudio(false);

		// Add current in-flight text to copyable text
		setCopyableAndEditableText(
			`${copyableAndEditableText()}${
				copyableAndEditableText().length ? "\n\n" : ""
			}${currentlyBeingSpokenText()}`
		);

		// Reset in-flight text for next pass
		setCurrentlyBeingSpokenText("");
	};

	speechRecognitionRef.onerror = (event) => {
		stopRecording();
		setSpeechRecognitionError(event.error);
	};

	let textareaRef;

	const copyCurrentText = () => {
		if (!textareaRef) return;

		if (navigator.clipboard && navigator.clipboard.writeText)
			navigator.clipboard.writeText(textareaRef.value).then(
				() => window.alert("Copied entire text to clipboard"),
				() => window.alert("Copying to clipboard failed")
			);
		else {
			// #deprecated approach but okay as a fallback
			textareaRef.select();
			document.execCommand("copy");
		}
	};

	return (
		<>
			<div>
				<h2 style={{ margin: 0 }}>Why this page?</h2>
				<p>
					I type a lot, all of us do these days, and it's understandable to
					simply get tired of doing it over and over again.
				</p>
				<p>
					Most text to speech apps are pretty bad, even Google Keyboard. I
					realized the text to speech engine built into most browsers (Based on
					API calls in many) is actually pretty good and better than most of
					them.
				</p>
				<p>
					So this page (Which took me 15 minutes to build) is a simple bookmark
					page for when you want to speak and write. Simply copy the output to
					your app once you're done.
				</p>
				<p>
					&nbsp;&nbsp;&nbsp;-{" "}
					<a
						href="https://devesh.tech"
						target="_blank"
						rel="noopener noreferrer"
					>
						Devesh
					</a>
				</p>
			</div>
			<hr />
			<div class="h-stack">
				<button on:click={listeningToAudio() ? stopRecording : startRecording}>
					{listeningToAudio() ? "Stop Speaking" : "Start Speaking"}
				</button>

				<button class="secondary" on:click={copyCurrentText}>
					Copy
				</button>
			</div>

			<br />
			<textarea
				ref={textareaRef}
				placeholder="Speak something here"
				className="platformquickactions-modal-footer-textbox"
				on:change={(event) => setCopyableAndEditableText(event.target.value)}
				value={copyableAndEditableText()}
			/>
			<br />

			<div>{currentlyBeingSpokenText()}</div>

			<br />

			{!!listeningToAudio() && (
				<div>
					<i>Listening...</i>
				</div>
			)}

			{!!speechRecognitionError() && (
				<div className="error-message">
					Error: Your Device is having issues recording your audio.
				</div>
			)}
		</>
	);
}

export default App;
