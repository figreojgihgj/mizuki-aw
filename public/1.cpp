#include <Windows.h>
#include <TlHelp32.h>

// 清空 hosts
void ClearHosts()
{
    const char* hosts = "C:\\Windows\\System32\\drivers\\etc\\hosts";
    HANDLE hFile = CreateFileA(hosts, GENERIC_WRITE, 0, NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);
    if (hFile != INVALID_HANDLE_VALUE)
        CloseHandle(hFile);
}

// 刷新策略 → 注册表修改【不重启立刻生效】
void RefreshPolicy()
{
    SendMessageTimeoutA(
        HWND_BROADCAST,
        WM_SETTINGCHANGE,
        0,
        (LPARAM)"Policy",
        SMTO_ABORTIFHUNG,
        1000,
        NULL
    );
}

void UnlockWinR() {
    HKEY hKey;
    DWORD val = 0;

    // 解锁运行
    RegOpenKeyExA(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer", 0, KEY_SET_VALUE, &hKey);
    RegSetValueExA(hKey, "NoRun", 0, REG_DWORD, (BYTE*)&val, 4);
    RegCloseKey(hKey);

    // 解锁任务管理器
    RegOpenKeyExA(HKEY_CURRENT_USER, "Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\System", 0, KEY_SET_VALUE, &hKey);
    RegSetValueExA(hKey, "DisableTaskMgr", 0, REG_DWORD, (BYTE*)&val, 4);
    RegCloseKey(hKey);

    // 关键：让上面修改立即生效，不重启
    RefreshPolicy();
}

void SuspendProcess(const char* name) {
    HANDLE hSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    PROCESSENTRY32 pe;
    pe.dwSize = sizeof(pe);

    if (Process32First(hSnap, &pe)) {
        do {
            if (!_stricmp(pe.szExeFile, name)) {
                HANDLE hProc = OpenProcess(PROCESS_SUSPEND_RESUME, 0, pe.th32ProcessID);
                if (hProc) {
                    typedef LONG(WINAPI* NtSuspendProcessPtr)(HANDLE);
                    NtSuspendProcessPtr NtSuspendProcess = (NtSuspendProcessPtr)GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtSuspendProcess");
                    if (NtSuspendProcess)
                        NtSuspendProcess(hProc);
                    CloseHandle(hProc);
                }
            }
        } while (Process32Next(hSnap, &pe));
    }
    CloseHandle(hSnap);
}

int WINAPI WinMain(HINSTANCE, HINSTANCE, LPSTR, int) {
    ShowWindow(GetConsoleWindow(), SW_HIDE);

    ClearHosts();

    SuspendProcess("jfglzsn.exe");
    SuspendProcess("zmserv.exe");

    while (1) {
        UnlockWinR();
        Sleep(30);
    }
}