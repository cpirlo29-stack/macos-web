<script lang="ts">
	import Plus from '~icons/ic/outline-plus';
	import Equal from '~icons/ic/round-equals';
	import Minus from '~icons/ic/round-minus';
	import PlusMinus from '~icons/majesticons/plus-minus-2';
	import Division from '~icons/ph/divide-bold';
	import Multiply from '~icons/uil/multiply';

	let display = $state('0');
	let stored = $state<number | null>(null);
	let operation = $state<string | null>(null);
	let waitingForOperand = $state(false);
	let expression = $state('');

	function inputDigit(digit: string) {
		if (waitingForOperand) {
			display = digit;
			waitingForOperand = false;
		} else {
			display = display === '0' ? digit : display.length < 14 ? display + digit : display;
		}
	}
	function inputDecimal() {
		if (waitingForOperand) {
			display = '0.';
			waitingForOperand = false;
		} else if (!display.includes('.')) display += '.';
	}
	function clear() {
		display = '0'; stored = null; operation = null; waitingForOperand = false; expression = '';
	}
	function calculate(left: number, right: number, op: string): number {
		switch (op) {
			case '+': return left + right;
			case '−': return left - right;
			case '×': return left * right;
			case '÷': return right === 0 ? Number.NaN : left / right;
			default: return right;
		}
	}
	function format(value: number) {
		if (!Number.isFinite(value)) return 'Error';
		return String(Number(value.toPrecision(11)));
	}
	function chooseOperation(nextOperation: string) {
		const inputValue = Number(display);
		if (display === 'Error') return;
		if (stored === null) stored = inputValue;
		else if (operation && !waitingForOperand) {
			const result = calculate(stored, inputValue, operation);
			display = format(result);
			stored = result;
		}
		operation = nextOperation;
		waitingForOperand = true;
		expression = `${display} ${nextOperation}`;
	}
	function equals() {
		if (stored === null || !operation || display === 'Error') return;
		const result = calculate(stored, Number(display), operation);
		expression = `${stored} ${operation} ${display} =`;
		display = format(result);
		stored = null; operation = null; waitingForOperand = true;
	}
	function percent() {
		if (display !== 'Error') display = format(Number(display) / 100);
	}
	function toggleSign() {
		if (display !== '0' && display !== 'Error') display = display.startsWith('-') ? display.slice(1) : '-' + display;
	}
	function handleKeydown(event: KeyboardEvent) {
		if (/^[0-9]$/.test(event.key)) inputDigit(event.key);
		else if (event.key === '.') inputDecimal();
		else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); equals(); }
		else if (event.key === 'Escape' || event.key === 'Backspace') clear();
		else if (event.key === '+') chooseOperation('+');
		else if (event.key === '-') chooseOperation('−');
		else if (event.key === '*') chooseOperation('×');
		else if (event.key === '/') { event.preventDefault(); chooseOperation('÷'); }
		else if (event.key === '%') percent();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="container">
	<header class="app-window-drag-handle"></header>
	<section class="show-area" aria-live="polite">
		<div class="expression">{expression || ' '}</div>
		<output>{display}</output>
	</section>
	<section class="buttons-container">
		<button class="top-row-button" onclick={clear}>AC</button>
		<button class="top-row-button" onclick={toggleSign} aria-label="Change sign"><PlusMinus /></button>
		<button class="top-row-button" onclick={percent}>%</button>
		<button class="operation-button" onclick={() => chooseOperation('÷')} aria-label="Divide"><Division /></button>
		<button class="number-button" onclick={() => inputDigit('7')}>7</button>
		<button class="number-button" onclick={() => inputDigit('8')}>8</button>
		<button class="number-button" onclick={() => inputDigit('9')}>9</button>
		<button class="operation-button" onclick={() => chooseOperation('×')} aria-label="Multiply"><Multiply /></button>
		<button class="number-button" onclick={() => inputDigit('4')}>4</button>
		<button class="number-button" onclick={() => inputDigit('5')}>5</button>
		<button class="number-button" onclick={() => inputDigit('6')}>6</button>
		<button class="operation-button" onclick={() => chooseOperation('−')} aria-label="Subtract"><Minus /></button>
		<button class="number-button" onclick={() => inputDigit('1')}>1</button>
		<button class="number-button" onclick={() => inputDigit('2')}>2</button>
		<button class="number-button" onclick={() => inputDigit('3')}>3</button>
		<button class="operation-button" onclick={() => chooseOperation('+')} aria-label="Add"><Plus /></button>
		<button class="number-button curved-bottom-left-button" style:grid-column="1 / span 2" onclick={() => inputDigit('0')}>0</button>
		<button class="number-button" onclick={inputDecimal}>.</button>
		<button class="operation-button curved-bottom-right-button" onclick={equals} aria-label="Equals"><Equal /></button>
	</section>
</section>

<style>
	header { padding: 1rem; }
	.container { height:100%; width:100%; background-color:hsla(240,5%,12%,.7); backdrop-filter:blur(15px); border-radius:inherit; display:grid; grid-template-rows:auto auto 1fr; font-family:var(--system-font-family)!important; }
	.buttons-container { display:grid; grid-template-columns:repeat(4,1fr); grid-template-rows:repeat(5,1fr); gap:1px; margin:1.5px; }
	.buttons-container > button { font-size:1.414rem; font-weight:400!important; color:white; fill:white; cursor:pointer; transition:filter 100ms ease; }
	.buttons-container > button:active { filter:brightness(1.25); }
	:global(svg) { font-size:1.2rem; }
	.top-row-button { background-color:hsla(240,5%,12%,.2); }
	.number-button { background-color:hsla(240,5%,80%,.25); }
	.operation-button { background-color:hsl(37deg 98% 51%); }
	.curved-bottom-left-button { border-radius:0 0 0 .7rem; }
	.curved-bottom-right-button { border-radius:0 0 .7rem 0; }
	.show-area { min-width:0; color:white; text-align:end; padding:.2rem 1rem .6rem; overflow:hidden; }
	.show-area output { display:block; font-size:3rem; font-weight:200; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
	.expression { min-height:1.2rem; font-size:.8rem; color:#ffffff99; }
	:global(.tl-container.calculator) { top:.7rem; left:.7rem; }
</style>