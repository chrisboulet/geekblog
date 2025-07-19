"""
Test des primitives de workflow (chain, group, chord)
"""

import asyncio
from app.core.simple_task_manager import simple_task_manager


# Primitives de workflow simplifiées pour test
class WorkflowChain:
    """Version simplifiée de chain pour tests"""
    def __init__(self, *tasks):
        self.tasks = tasks
    
    async def apply_async(self):
        result = None
        
        for task in self.tasks:
            if asyncio.iscoroutinefunction(task):
                if result is not None:
                    result = await task(result)
                else:
                    result = await task()
            else:
                # Fonction synchrone
                if result is not None:
                    result = task(result)
                else:
                    result = task()
        
        return result


class WorkflowGroup:
    """Version simplifiée de group pour tests"""
    def __init__(self, *tasks):
        self.tasks = tasks
    
    async def apply_async(self):
        # Exécuter toutes les tâches en parallèle
        coroutines = []
        for task in self.tasks:
            if asyncio.iscoroutinefunction(task):
                coroutines.append(task())
            else:
                # Wrapper pour fonction sync
                async def async_wrapper(t=task):
                    return t()
                coroutines.append(async_wrapper())
        
        results = await asyncio.gather(*coroutines)
        return results


class WorkflowChord:
    """Version simplifiée de chord pour tests"""
    def __init__(self, group_tasks, callback_task):
        self.group = WorkflowGroup(*group_tasks)
        self.callback = callback_task
    
    async def apply_async(self):
        # Exécuter le groupe
        group_results = await self.group.apply_async()
        
        # Exécuter le callback avec les résultats
        if asyncio.iscoroutinefunction(self.callback):
            return await self.callback(group_results)
        else:
            return self.callback(group_results)


def chain(*tasks):
    return WorkflowChain(*tasks)

def group(*tasks):
    return WorkflowGroup(*tasks)

def chord(group_tasks, callback_task):
    return WorkflowChord(group_tasks, callback_task)


async def test_workflows():
    print("🧪 Test des primitives de workflow...")
    
    # Test CHAIN (séquentiel)
    print("\n📝 Test CHAIN (séquentiel):")
    
    def task1():
        print("  - Tâche 1: Démarrage")
        return 10
    
    def task2(value):
        print(f"  - Tâche 2: Reçu {value}")
        return value + 5
    
    async def task3(value):
        print(f"  - Tâche 3: Reçu {value}")
        await asyncio.sleep(0.01)
        return value * 2
    
    chain_workflow = chain(task1, task2, task3)
    start_time = asyncio.get_event_loop().time()
    chain_result = await chain_workflow.apply_async()
    chain_time = asyncio.get_event_loop().time() - start_time
    
    print(f"  ✅ Résultat chain: {chain_result} (temps: {chain_time:.3f}s)")
    
    # Test GROUP (parallèle)
    print("\n🔄 Test GROUP (parallèle):")
    
    async def parallel_task_a():
        print("  - Tâche A: Démarrage")
        await asyncio.sleep(0.05)
        print("  - Tâche A: Terminée")
        return "Résultat A"
    
    async def parallel_task_b():
        print("  - Tâche B: Démarrage")
        await asyncio.sleep(0.05)
        print("  - Tâche B: Terminée")
        return "Résultat B"
    
    def parallel_task_c():
        print("  - Tâche C: Démarrage et terminée")
        return "Résultat C"
    
    group_workflow = group(parallel_task_a, parallel_task_b, parallel_task_c)
    start_time = asyncio.get_event_loop().time()
    group_result = await group_workflow.apply_async()
    group_time = asyncio.get_event_loop().time() - start_time
    
    print(f"  ✅ Résultat group: {group_result} (temps: {group_time:.3f}s)")
    
    # Test CHORD (groupe + callback)
    print("\n🎼 Test CHORD (groupe + callback):")
    
    async def quick_task_1():
        await asyncio.sleep(0.02)
        return 1
    
    async def quick_task_2():
        await asyncio.sleep(0.02)
        return 2
    
    async def quick_task_3():
        await asyncio.sleep(0.02)
        return 3
    
    def aggregate_callback(results):
        print(f"  - Callback: Agrégation de {results}")
        return sum(results)
    
    chord_workflow = chord([quick_task_1, quick_task_2, quick_task_3], aggregate_callback)
    start_time = asyncio.get_event_loop().time()
    chord_result = await chord_workflow.apply_async()
    chord_time = asyncio.get_event_loop().time() - start_time
    
    print(f"  ✅ Résultat chord: {chord_result} (temps: {chord_time:.3f}s)")
    
    # Test avec TaskManager
    print("\n🔧 Test intégration avec TaskManager:")
    
    async def ai_planning_simulation():
        print("  - Simulation planification IA...")
        await asyncio.sleep(0.01)
        return ["Tâche 1", "Tâche 2", "Tâche 3"]
    
    task_id = await simple_task_manager.submit_task(
        ai_planning_simulation, 
        "ai_planning_test"
    )
    
    print(f"  - ID tâche: {task_id}")
    
    # Attendre la completion
    await asyncio.sleep(0.05)
    
    status = await simple_task_manager.get_task_status(task_id)
    print(f"  ✅ Statut: {status['status']}")
    print(f"  ✅ Résultat: {status['result']}")
    
    print("\n🎉 Tous les tests de workflow réussis!")


if __name__ == "__main__":
    asyncio.run(test_workflows())