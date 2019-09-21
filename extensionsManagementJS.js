chrome.management.onInstalled.addListener(info => { //When an extension is installed
	var extInfo= "Name: " + info.name + " Extension ID: " + info.id;
	notifyAction("1137", extInfo);
	showTrayNotification(2, "Acción prohibida", "No tienes permisos para instalar extensiones. Tu acción será notificada.");
});

chrome.management.onUninstalled.addListener(id => { //When an extension is uninstalled
	var extInfo= "Extension ID: " + id;
	notifyAction("1135", extInfo);
	showTrayNotification(2, "Acción prohibida", "No tienes permisos para desinstalar extensiones. Tu acción será notificada.");
});

chrome.management.onEnabled.addListener(info => { //When an extension is enabled
	if (info.id !== chrome.runtime.id){ //The own extension can be enabled
		var extInfo= "Name: " + info.name + " Extension ID: " + info.id;
		notifyAction("1138", extInfo);
		showTrayNotification(2, "Acción prohibida", "No tienes permisos para habilitar extensiones. Tu acción será notificada.");
		chrome.management.setEnabled(info.id, false); //It should be disabled again
	}
});

chrome.management.onDisabled.addListener(info => { //When an extension is disabled
	var extInfo= "Name: " + info.name + " Extension ID: " + info.id;
	notifyAction("1136", extInfo);
	showTrayNotification(2, "Acción prohibida", "No tienes permisos para deshabilitar extensiones. Tu acción será notificada.");
});