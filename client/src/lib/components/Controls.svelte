{#snippet button(label)}
	<button class="py-2 px-3 font-semibold text-sm rounded-md hover:bg-primary-700 hover:text-white cursor-pointer ease-in-out transition-colors">
		{label}
	</button>
{/snippet}

<div class="fixed top-4 left-4 rounded-md bg-white shadow-md text-primary-700 p-1">
	{@render button("Chatt")}
    {@render button("Regler")}
    {@render button("Avsluta")}
</div>
