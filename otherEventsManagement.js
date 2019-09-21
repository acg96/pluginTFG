//When a bookmark is created it gets deleted
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
	showTrayNotification(1, "Acción no válida", "No se permite añadir marcadores.");
	chrome.bookmarks.remove(id);
});

//When the browser is opened the information of the browser it gets deleted
chrome.runtime.onStartup.addListener(() => {
	onSessionClosed();
});