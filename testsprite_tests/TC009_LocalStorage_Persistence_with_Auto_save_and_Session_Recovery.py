import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Create tasks by checking some task checkboxes and modify settings if possible.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[6]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[8]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[10]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[12]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Modify settings and update stats to trigger auto-save and verify persistence.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[6]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Modify some settings values and save changes to trigger auto-save.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[3]/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[4]/div/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('35000')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/div/div[8]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Refresh the browser tab to verify that all data persists and reloads correctly.
        await page.goto('http://localhost:8080/', timeout=10000)
        

        # Test auto-save triggers by making changes again and monitor localStorage immediately after each change to identify if saving occurs.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Try modifying settings again and check if localStorage updates. If not, conclude that auto-save and persistence are not working properly.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[6]/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Test modifying stats or XP if possible, and verify if localStorage updates. Then test reload to confirm persistence of settings and any other data that updates.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[5]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Perform a final browser reload to verify persistence of stats, XP, and settings after reload, and confirm task data persistence again.
        await page.goto('http://localhost:8080/', timeout=10000)
        

        # Check task checkboxes to confirm if UI state matches localStorage and test if task completion persists after reload.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/main/div[4]/div/div[6]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert that localStorage contains user data for tasks, stats, XP, and settings after reload
        local_storage = await page.evaluate('''() => { return window.localStorage; }''')
        assert 'tasks' in local_storage, 'Tasks data missing in localStorage after reload'
        assert 'stats' in local_storage, 'Stats data missing in localStorage after reload'
        assert 'xp' in local_storage, 'XP data missing in localStorage after reload'
        assert 'settings' in local_storage, 'Settings data missing in localStorage after reload'
        # Parse stored data to verify it matches expected values from page content
        tasks_data = await page.evaluate('''() => JSON.parse(window.localStorage.getItem('tasks'))''')
        stats_data = await page.evaluate('''() => JSON.parse(window.localStorage.getItem('stats'))''')
        xp_data = await page.evaluate('''() => JSON.parse(window.localStorage.getItem('xp'))''')
        settings_data = await page.evaluate('''() => JSON.parse(window.localStorage.getItem('settings'))''')
        # Validate that tasks data is not empty and matches UI state
        assert tasks_data is not None and len(tasks_data) > 0, 'Tasks data is empty or None'
        # Validate stats data contains expected keys
        expected_stats_keys = ['energy', 'mind', 'power', 'social', 'pro', 'active_boosts', 'game_day', 'current_streak']
        for key in expected_stats_keys:
            assert key in stats_data, f'Stat key {key} missing in stats data'
        # Validate XP data has expected level and xp values
        assert 'level' in xp_data and 'xp' in xp_data, 'XP data missing level or xp keys'
        assert xp_data['level'] == 1, 'XP level mismatch'
        assert xp_data['xp'] == 250, 'XP value mismatch'
        # Validate settings data contains expected keys
        expected_settings_keys = ['reward_settings', 'focus_timer', 'share_progress']
        for key in expected_settings_keys:
            assert key in settings_data, f'Settings key {key} missing in settings data'
        # Confirm auto-save was triggered by checking timestamps or save flags if available
        auto_save_flag = await page.evaluate('''() => window.localStorage.getItem('autoSaveTriggered')''')
        assert auto_save_flag == 'true', 'Auto-save was not triggered on changes'
        # Confirm no data loss or mismatch on reload by comparing stored data with page content
        page_stats = await page.evaluate('''() => { return { energy: window.appState.energy, mind: window.appState.mind, power: window.appState.power, social: window.appState.social, pro: window.appState.pro, active_boosts: window.appState.activeBoosts, game_day: window.appState.gameDay, current_streak: window.appState.currentStreak }; }''')
        for key in expected_stats_keys:
            assert stats_data[key] == page_stats[key], f'Stats data mismatch for {key}'
        # Check task completion state in UI matches tasks data
        for i, task in enumerate(tasks_data):
            task_checkbox = frame.locator(f'xpath=html/body/div/main/div[4]/div/div[{2*i+2}]/div/input').nth(0)
            ui_checked = await task_checkbox.is_checked()
            assert ui_checked == task['completed'], f'Task completion mismatch for task index {i}'
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    