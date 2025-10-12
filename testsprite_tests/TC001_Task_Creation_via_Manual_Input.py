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
        # Click the button or element that leads to the Todo task creation page.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[6]/button[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Enter a task description and select a priority level, then submit the new task.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test task with low priority')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Enter a new task with medium priority, submit it, and verify it appears correctly with updated reward points.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test task with medium priority')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Enter a new task with high priority, submit it, and verify it appears correctly with updated reward points.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test task with high priority')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Enter a new task with epic priority, submit it, and verify it appears correctly with updated reward points.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test task with epic priority')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[7]/div/div[2]/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert that the tasks are displayed in the task list with correct priority and reward info
        frame = context.pages[-1]
        task_list = frame.locator('xpath=html/body/div/div[7]/div/div[3]/div')  # Assuming task list container
        tasks = [
            {'name': 'Test task with low priority', 'priority': 'simple', 'reward_range': (10, 50)},
            {'name': 'Test task with medium priority', 'priority': 'medium', 'reward_range': (50, 150)},
            {'name': 'Test task with high priority', 'priority': 'hard', 'reward_range': (150, 300)},
            {'name': 'Test task with epic priority', 'priority': 'epic_quest', 'reward_range': (300, 500)}
         ]
        for task in tasks:
            task_locator = task_list.locator(f'text={task["name"]}')
            assert await task_locator.count() > 0, f"Task '{task['name']}' not found in task list"
            # Optionally check priority color or label if available
            # Check reward is within expected range
            reward_text = await task_locator.locator('xpath=./following-sibling::*[1]').inner_text()  # Assuming reward is next sibling
            reward_value = int(''.join(filter(str.isdigit, reward_text)))
            assert task['reward_range'][0] <= reward_value <= task['reward_range'][1], f"Reward for task '{task['name']}' out of expected range"
        # Verify the reward points pool updates correctly based on task priority
        # Sum rewards from all tasks
        total_reward = 0
        for task in tasks:
            reward_text = await task_list.locator(f'text={task["name"]}').locator('xpath=./following-sibling::*[1]').inner_text()
            reward_value = int(''.join(filter(str.isdigit, reward_text)))
            total_reward += reward_value
        # Check the total reward matches the sum of individual task rewards
        earned_text = await frame.locator('xpath=html/body/div/div[7]/div/div[4]/div/span').inner_text()  # Assuming earned reward display
        earned_value = int(''.join(filter(str.isdigit, earned_text)))
        assert earned_value == total_reward, f"Earned reward {earned_value} does not match total task rewards {total_reward}"
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    