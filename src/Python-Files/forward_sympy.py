#!/usr/bin/env python3
import sys
import re
from sympy import symbols, Eq, sympify, simplify_logic, solve
from sympy.core.relational import Relational


def forward(pre: str, stmt: str) -> str:
    #changes Java operators to SymPy bitwise operators
    pre_trans = pre.replace('&&', ' & ').replace('||', ' | ').replace('!', '~')
    #wrap each relational atom in parentheses for correct parsing
    def wrap_rel(m):
        return f"({m.group(0)})"
    pre_trans = re.sub(r'[a-zA-Z_]\w*\s*(?:==|!=|>=|<=|>|<)\s*[^&|()]+', wrap_rel, pre_trans)

    #gets rid of semicolon
    stmt_clean = stmt.rstrip(';').strip()
    m = re.match(r"^([a-zA-Z]\w*)\s*=\s*(.+)$", stmt_clean)
    if not m:
        raise ValueError(f"Cannot parse statement: {stmt}")
    var, expr_str = m.group(1), m.group(2)

    #create lhs and rhs variables
    old_var = symbols(var + '_old')
    new_var = symbols(var)

    #subtitutes var with old var
    pre_cond = sympify(pre_trans, locals={var: old_var}, evaluate=False)
    expr = sympify(expr_str, locals={var: old_var}, evaluate=False)

    #creates expression equal to new_var
    eq = Eq(new_var, expr)

    #solves for old var
    sol = solve(eq, old_var)
    if sol:
        sol_old = sol[0]
        #substitutes solution into pre_cond and simplifies
        post_simpl = simplify_logic(pre_cond.subs({old_var: sol_old}), force=True)
        return str(post_simpl)

    #if unsolvable, gets strongest postcondition
    substituted_pre = pre_cond.subs({old_var: expr})
    fallback = simplify_logic(substituted_pre & eq, force=True)
    return str(fallback)


#errors
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("ERROR: expected 2 args: pre stmt;")
        sys.exit(1)
    try:
        print(forward(sys.argv[1], sys.argv[2]))
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
